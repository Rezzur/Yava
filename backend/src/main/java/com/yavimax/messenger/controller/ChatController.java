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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
@Tag(name = "Chats", description = "Chat management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ChatController {

    private final ChatService chatService;
    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get user chats", description = "Returns all chats for the current user")
    public ResponseEntity<List<ChatDto>> getUserChats() {
        Long userId = userService.getCurrentUserId();
        return ResponseEntity.ok(chatService.getUserChats(userId));
    }

    @PostMapping
    @Operation(summary = "Create private chat", description = "Creates a new private chat with a user")
    public ResponseEntity<ChatDto> createChat(@RequestParam Long userId) {
        Long currentUserId = userService.getCurrentUserId();
        return ResponseEntity.ok(chatService.createPrivateChat(currentUserId, userId));
    }

    @GetMapping("/{chatId}")
    @Operation(summary = "Get chat by ID")
    public ResponseEntity<ChatDto> getChat(@PathVariable Long chatId) {
        List<ChatDto> chats = chatService.getUserChats(userService.getCurrentUserId());
        return ResponseEntity.ok(chats.stream()
                .filter(c -> c.getId().equals(chatId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Chat not found")));
    }

    @GetMapping("/{chatId}/messages")
    @Operation(summary = "Get chat messages", description = "Returns paginated messages for a chat")
    public ResponseEntity<List<MessageDto>> getChatMessages(
            @PathVariable Long chatId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(chatService.getChatMessages(chatId, page, size));
    }

    @PostMapping("/{chatId}/messages")
    @Operation(summary = "Send message", description = "Sends a text message to the chat")
    public ResponseEntity<MessageDto> sendMessage(
            @PathVariable Long chatId,
            @RequestBody SendMessageRequest request
    ) {
        Long senderId = userService.getCurrentUserId();
        MessageType type = request.getType() != null ? 
                MessageType.valueOf(request.getType().toUpperCase()) : MessageType.TEXT;
        return ResponseEntity.ok(chatService.sendMessage(chatId, senderId, request.getText(), type));
    }

    public static class SendMessageRequest {
        private String text;
        private String type;

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }
}
