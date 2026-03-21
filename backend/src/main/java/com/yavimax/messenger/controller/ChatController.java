package com.yavimax.messenger.controller;

import com.yavimax.messenger.dto.ChatDto;
import com.yavimax.messenger.dto.MessageDto;
import com.yavimax.messenger.entity.MessageType;
import com.yavimax.messenger.service.ChatService;
import com.yavimax.messenger.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Chat management endpoints")
@SecurityRequirement(name = "bearerAuth")
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get user chats", description = "Returns list of chats for the current user")
    public ResponseEntity<List<ChatDto>> getChats() {
        Long currentUserId = userService.getCurrentUserId();
        return ResponseEntity.ok(chatService.getUserChats(currentUserId));
    }

    @PostMapping
    @Operation(summary = "Create private chat", description = "Creates a new private chat with specified user or returns existing one")
    public ResponseEntity<?> createChat(@RequestParam Long userId) {
        log.info("REST request to create chat with user: {}", userId);
        try {
            Long currentUserId = userService.getCurrentUserId();
            ChatDto chat = chatService.createPrivateChat(currentUserId, userId);
            return ResponseEntity.ok(chat);
        } catch (Exception e) {
            log.error("Failed to create chat: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{chatId}/messages")
    @Operation(summary = "Get chat messages", description = "Returns paginated messages for a specific chat")
    public ResponseEntity<List<MessageDto>> getMessages(
            @PathVariable Long chatId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(chatService.getChatMessages(chatId, page, size));
    }

    @PostMapping("/{chatId}/messages")
    @Operation(summary = "Send message", description = "Sends a new message to a specific chat")
    public ResponseEntity<MessageDto> sendMessage(
            @PathVariable Long chatId,
            @RequestBody MessageRequest request) {
        Long currentUserId = userService.getCurrentUserId();
        return ResponseEntity.ok(chatService.sendMessage(
                chatId,
                currentUserId,
                request.getText(),
                MessageType.valueOf(request.getType().toUpperCase())
        ));
    }

    @PostMapping("/{chatId}/read")
    @Operation(summary = "Mark as read", description = "Marks all messages in chat as read for the current user")
    public ResponseEntity<Void> markAsRead(@PathVariable Long chatId) {
        Long currentUserId = userService.getCurrentUserId();
        chatService.markAsRead(chatId, currentUserId);
        return ResponseEntity.ok().build();
    }

    public static class MessageRequest {
        private String text;
        private String type;

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }
}
