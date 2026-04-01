package com.yavimax.messenger.websocket;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.yavimax.messenger.dto.MessageDto;
import com.yavimax.messenger.entity.MessageType;
import com.yavimax.messenger.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatMessageHandler {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void handleSendMessage(@Payload SendMessageRequest request) {
        try {
            Long senderId = request.senderId();
            Long chatId = request.chatId();
            String text = request.text();

            if (chatId == null || senderId == null || text == null || text.isBlank()) {
                log.warn("Invalid message request: missing required fields");
                return;
            }

            MessageDto message = chatService.sendMessage(chatId, senderId, text.trim(), MessageType.TEXT, null);

            WebSocketMessage<Map<String, Object>> wsMessage = WebSocketMessage.<Map<String, Object>>builder()
                    .type("message.created")
                    .payload(Map.of(
                            "id", message.getId(),
                            "chatId", message.getChatId(),
                            "sender", message.getSender(),
                            "text", message.getText() != null ? message.getText() : "",
                            "type", message.getType(),
                            "mediaUrl", message.getMediaUrl() != null ? message.getMediaUrl() : "",
                            "isRead", message.getIsRead(),
                            "createdAt", message.getCreatedAt() != null ? message.getCreatedAt().toString() : LocalDateTime.now().toString()
                    ))
                    .timestamp(LocalDateTime.now())
                    .build();

            messagingTemplate.convertAndSend("/topic/chats." + chatId, wsMessage);
            log.debug("Message {} sent to chat {}", message.getId(), chatId);

        } catch (Exception e) {
            log.error("Error handling send message: {}", e.getMessage(), e);
            sendErrorToUser(request.senderId(), "Failed to send message");
        }
    }

    @MessageMapping("/chat.readMessage")
    public void handleReadMessage(@Payload ReadMessageRequest request) {
        try {
            Long userId = request.userId();
            Long chatId = request.chatId();
            Long messageId = request.messageId();

            if (userId == null || chatId == null) {
                log.warn("Invalid read message request: missing required fields");
                return;
            }

            WebSocketMessage<Map<String, Object>> wsMessage = WebSocketMessage.<Map<String, Object>>builder()
                    .type("message.read")
                    .payload(Map.of(
                            "chatId", chatId,
                            "userId", userId,
                            "messageId", messageId != null ? messageId : -1,
                            "readAt", LocalDateTime.now().toString()
                    ))
                    .timestamp(LocalDateTime.now())
                    .build();

            messagingTemplate.convertAndSend("/topic/chats." + chatId, wsMessage);
            log.debug("Read status broadcast for chat {}", chatId);

        } catch (Exception e) {
            log.error("Error handling read message: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/chat.typing")
    public void handleTypingIndicator(@Payload TypingRequest request) {
        try {
            Long chatId = request.chatId();
            Long userId = request.userId();
            Boolean isTyping = request.isTyping();

            if (chatId == null || userId == null || isTyping == null) {
                log.warn("Invalid typing request: missing required fields");
                return;
            }

            WebSocketMessage<Map<String, Object>> wsMessage = WebSocketMessage.<Map<String, Object>>builder()
                    .type("user.typing")
                    .payload(Map.of(
                            "chatId", chatId,
                            "userId", userId,
                            "isTyping", isTyping
                    ))
                    .timestamp(LocalDateTime.now())
                    .build();

            messagingTemplate.convertAndSend("/topic/chats." + chatId, wsMessage);

        } catch (Exception e) {
            log.error("Error handling typing indicator: {}", e.getMessage(), e);
        }
    }

    private void sendErrorToUser(Long userId, String errorMessage) {
        WebSocketMessage<Map<String, String>> errorMsg = WebSocketMessage.<Map<String, String>>builder()
                .type("error")
                .payload(Map.of("message", errorMessage))
                .timestamp(LocalDateTime.now())
                .build();
        messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/errors", errorMsg);
    }

    public record SendMessageRequest(
            Long chatId,
            Long senderId,
            String text
    ) {}

    public record ReadMessageRequest(
            Long chatId,
            Long userId,
            Long messageId
    ) {}

    public record TypingRequest(
            Long chatId,
            Long userId,
            Boolean isTyping
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record WebSocketMessage<T>(
            String type,
            T payload,
            LocalDateTime timestamp
    ) {
        public static <T> Builder<T> builder() {
            return new Builder<>();
        }

        public static class Builder<T> {
            private String type;
            private T payload;
            private LocalDateTime timestamp;

            public Builder<T> type(String type) {
                this.type = type;
                return this;
            }

            public Builder<T> payload(T payload) {
                this.payload = payload;
                return this;
            }

            public Builder<T> timestamp(LocalDateTime timestamp) {
                this.timestamp = timestamp;
                return this;
            }

            public WebSocketMessage<T> build() {
                return new WebSocketMessage<>(type, payload, timestamp);
            }
        }
    }
}
