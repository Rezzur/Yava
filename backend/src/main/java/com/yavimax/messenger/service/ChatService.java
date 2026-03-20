package com.yavimax.messenger.service;

import com.yavimax.messenger.dto.ChatDto;
import com.yavimax.messenger.dto.MessageDto;
import com.yavimax.messenger.dto.UserSummaryDto;
import com.yavimax.messenger.entity.Chat;
import com.yavimax.messenger.entity.ChatMember;
import com.yavimax.messenger.entity.ChatMemberId;
import com.yavimax.messenger.entity.ChatType;
import com.yavimax.messenger.entity.Message;
import com.yavimax.messenger.entity.MessageType;
import com.yavimax.messenger.entity.User;
import com.yavimax.messenger.repository.ChatMemberRepository;
import com.yavimax.messenger.repository.ChatRepository;
import com.yavimax.messenger.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final MessageRepository messageRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<ChatDto> getUserChats(Long userId) {
        return chatMemberRepository.findByUserIdWithDetails(userId).stream()
                .map(this::toChatDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatDto createPrivateChat(Long userId1, Long userId2) {
        Optional<Chat> existingChat = chatRepository.findPrivateChatBetweenUsers(userId1, userId2);
        if (existingChat.isPresent()) {
            return toChatDto(existingChat.get());
        }

        Chat chat = Chat.builder()
                .type(ChatType.PRIVATE)
                .build();
        chat = chatRepository.save(chat);

        chatMemberRepository.save(ChatMember.builder()
                .id(new ChatMemberId(chat.getId(), userId1))
                .chat(chat)
                .user(User.builder().id(userId1).build())
                .build());

        chatMemberRepository.save(ChatMember.builder()
                .id(new ChatMemberId(chat.getId(), userId2))
                .chat(chat)
                .user(User.builder().id(userId2).build())
                .build());

        return toChatDto(chat);
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

        Message message = Message.builder()
                .chat(chat)
                .sender(User.builder().id(senderId).build())
                .text(text)
                .type(type)
                .build();

        Message saved = messageRepository.save(message);
        return toMessageDto(saved);
    }

    private ChatDto toChatDto(ChatMember member) {
        Chat chat = member.getChat();
        ChatDto.ChatDtoBuilder builder = ChatDto.builder()
                .id(chat.getId())
                .type(chat.getType().name().toLowerCase())
                .title(chat.getTitle())
                .avatarUrl(chat.getAvatarUrl())
                .isPinned(false);

        if (chat.getType() == ChatType.PRIVATE) {
            List<User> members = chatMemberRepository.findByChatId(chat.getId()).stream()
                    .map(m -> m.getUser())
                    .filter(u -> !u.getId().equals(userService.getCurrentUserId()))
                    .collect(Collectors.toList());
            
            if (!members.isEmpty()) {
                User otherUser = members.get(0);
                builder.user(userService.toUserSummary(otherUser));
                builder.title(otherUser.getName());
                builder.avatarUrl(otherUser.getAvatarUrl());
            }
        }

        Optional<Message> lastMessage = messageRepository.findLastMessageByChatId(chat.getId());
        lastMessage.ifPresent(msg -> {
            builder.lastMessage(msg.getText());
            builder.timestamp(formatTimestamp(msg.getCreatedAt()));
        });

        builder.unreadCount(messageRepository.countUnreadMessages(chat.getId(), userService.getCurrentUserId()));

        return builder.build();
    }

    private ChatDto toChatDto(Chat chat) {
        return ChatDto.builder()
                .id(chat.getId())
                .type(chat.getType().name().toLowerCase())
                .title(chat.getTitle())
                .avatarUrl(chat.getAvatarUrl())
                .timestamp(formatTimestamp(chat.getCreatedAt()))
                .build();
    }

    private MessageDto toMessageDto(Message message) {
        return MessageDto.builder()
                .id(message.getId())
                .chatId(message.getChat().getId())
                .sender(userService.getUserSummary(message.getSender().getId()))
                .text(message.getText())
                .type(message.getType().name().toLowerCase())
                .mediaUrl(message.getMediaUrl())
                .isRead(message.getIsRead())
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
