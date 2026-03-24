package com.yavimax.messenger.service;

import com.yavimax.messenger.dto.ChatDto;
import com.yavimax.messenger.dto.MessageDto;
import com.yavimax.messenger.dto.UserSummaryDto;
import com.yavimax.messenger.entity.Chat;
import com.yavimax.messenger.entity.ChatMember;
import com.yavimax.messenger.entity.ChatMemberId;
import com.yavimax.messenger.entity.ChatType;
import com.yavimax.messenger.entity.MemberRole;
import com.yavimax.messenger.entity.Message;
import com.yavimax.messenger.entity.MessageType;
import com.yavimax.messenger.entity.User;
import com.yavimax.messenger.repository.ChatMemberRepository;
import com.yavimax.messenger.repository.ChatRepository;
import com.yavimax.messenger.repository.MessageRepository;
import com.yavimax.messenger.repository.UserRepository;
import com.yavimax.messenger.websocket.ChatMessageHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<ChatDto> getUserChats(Long userId) {
        return chatMemberRepository.findByUserIdWithDetails(userId).stream()
                .map(member -> toChatDto(userId, member.getChat()))
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatDto createPrivateChat(Long userId1, Long userId2) {
        log.info("Creating private chat between {} and {}", userId1, userId2);
        try {
            Optional<Chat> existingChat;
            if (userId1.equals(userId2)) {
                existingChat = chatRepository.findByUserId(userId1).stream()
                        .filter(c -> c.getType() == ChatType.PRIVATE)
                        .filter(c -> {
                            List<ChatMember> members = chatMemberRepository.findByChatId(c.getId());
                            return members.size() == 1 && members.get(0).getUser().getId().equals(userId1);
                        })
                        .findFirst();
            } else {
                existingChat = chatRepository.findPrivateChatBetweenUsers(userId1, userId2);
            }

            if (existingChat.isPresent()) {
                log.info("Found existing chat: {}", existingChat.get().getId());
                return toChatDto(userId1, existingChat.get());
            }

            Chat chat = Chat.builder()
                    .type(ChatType.PRIVATE)
                    .createdAt(LocalDateTime.now())
                    .build();
            chat = chatRepository.save(chat);

            User user1 = userRepository.findById(userId1).orElseThrow(() -> new RuntimeException("User 1 not found"));
            
            ChatMember member1 = new ChatMember();
            member1.setId(new ChatMemberId(chat.getId(), userId1));
            member1.setChat(chat);
            member1.setUser(user1);
            member1.setRole(MemberRole.MEMBER);
            member1.setJoinedAt(LocalDateTime.now());
            chatMemberRepository.save(member1);

            if (!userId1.equals(userId2)) {
                User user2 = userRepository.findById(userId2).orElseThrow(() -> new RuntimeException("User 2 not found"));
                ChatMember member2 = new ChatMember();
                member2.setId(new ChatMemberId(chat.getId(), userId2));
                member2.setChat(chat);
                member2.setUser(user2);
                member2.setRole(MemberRole.MEMBER);
                member2.setJoinedAt(LocalDateTime.now());
                chatMemberRepository.save(member2);
            }

            return toChatDto(userId1, chat);
        } catch (Exception e) {
            log.error("Error creating private chat: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<MessageDto> getChatMessages(Long chatId, int page, int size) {
        return messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, PageRequest.of(page, size)).stream()
                .map(this::toMessageDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageDto sendMessage(Long chatId, Long senderId, String text, MessageType type) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        User sender = userRepository.findById(senderId).orElseThrow(() -> new RuntimeException("Sender not found"));

        Message message = Message.builder()
                .chat(chat)
                .sender(sender)
                .text(text)
                .type(type)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        Message saved = messageRepository.save(message);
        MessageDto dto = toMessageDto(saved);

        // Broadcast message via WebSocket with correct types
        ChatMessageHandler.WebSocketMessage<MessageDto> wsMessage = ChatMessageHandler.WebSocketMessage.<MessageDto>builder()
                .type("message.created")
                .payload(dto)
                .timestamp(LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend("/topic/chats." + chatId, wsMessage);
        
        return dto;
    }

    @Transactional
    public void markAsRead(Long chatId, Long userId) {
        log.info("Marking messages in chat {} as read by user {}", chatId, userId);
        messageRepository.markMessagesAsRead(chatId, userId);
    }

    private ChatDto toChatDto(Long currentUserId, Chat chat) {
        if (chat == null) return null;
        
        ChatDto.ChatDtoBuilder builder = ChatDto.builder()
                .id(chat.getId())
                .type(chat.getType() != null ? chat.getType().name().toLowerCase() : "private")
                .title(chat.getTitle() != null ? chat.getTitle() : "")
                .avatarUrl(chat.getAvatarUrl())
                .isPinned(false)
                .unreadCount(0)
                .timestamp(formatTimestamp(chat.getCreatedAt() != null ? chat.getCreatedAt() : LocalDateTime.now()))
                .membersCount(0)
                .lastMessage("");

        List<ChatMember> members = chatMemberRepository.findByChatId(chat.getId());
        builder.membersCount(members.size());

        if (chat.getType() == ChatType.PRIVATE) {
            User otherUser = null;
            if (members.size() == 1) {
                otherUser = members.get(0).getUser();
            } else if (!members.isEmpty()) {
                otherUser = members.stream()
                        .map(ChatMember::getUser)
                        .filter(u -> !u.getId().equals(currentUserId))
                        .findFirst()
                        .orElse(members.get(0).getUser());
            }

            if (otherUser != null) {
                builder.user(userService.toUserSummary(otherUser));
                if (chat.getTitle() == null || chat.getTitle().isEmpty()) builder.title(otherUser.getName());
                if (chat.getAvatarUrl() == null) builder.avatarUrl(otherUser.getAvatarUrl());
            }
        }

        try {
            messageRepository.findFirstByChatIdOrderByCreatedAtDesc(chat.getId()).ifPresent(msg -> {
                builder.lastMessage(msg.getText() != null ? msg.getText() : "");
                builder.timestamp(formatTimestamp(msg.getCreatedAt()));
            });

            Long unreadCount = messageRepository.countUnreadMessages(chat.getId(), currentUserId);
            builder.unreadCount(unreadCount != null ? unreadCount.intValue() : 0);
        } catch (Exception e) {
            log.warn("Error fetching last message or unread count for chat {}: {}", chat.getId(), e.getMessage());
        }

        return builder.build();
    }

    private MessageDto toMessageDto(Message message) {
        if (message == null) return null;
        return MessageDto.builder()
                .id(message.getId())
                .chatId(message.getChat().getId())
                .sender(userService.getUserSummary(message.getSender().getId()))
                .text(message.getText() != null ? message.getText() : "")
                .type(message.getType() != null ? message.getType().name().toLowerCase() : "text")
                .mediaUrl(message.getMediaUrl())
                .isRead(Boolean.TRUE.equals(message.getIsRead()))
                .createdAt(message.getCreatedAt())
                .timestamp(formatTimestamp(message.getCreatedAt()))
                .build();
    }

    private String formatTimestamp(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        
        LocalDateTime now = LocalDateTime.now();
        if (dateTime.toLocalDate().equals(now.toLocalDate())) {
            return dateTime.format(DateTimeFormatter.ofPattern("HH:mm"));
        } else if (dateTime.toLocalDate().equals(now.toLocalDate().minusDays(1))) {
            return "Вчера";
        } else {
            return dateTime.format(DateTimeFormatter.ofPattern("dd.MM.yyyy"));
        }
    }
}
