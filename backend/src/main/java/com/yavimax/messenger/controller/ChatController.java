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

/**
 * Контроллер для управления чатами и сообщениями.
 * Предоставляет эндпоинты для получения списка чатов, создания новых чатов и отправки сообщений.
 */
@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Управление чатами и сообщениями")
@SecurityRequirement(name = "bearerAuth")
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final UserService userService;

    /**
     * Возвращает список всех чатов текущего авторизованного пользователя.
     *
     * @return список DTO чатов
     */
    @GetMapping
    @Operation(summary = "Получить чаты пользователя", description = "Возвращает список всех активных чатов текущего пользователя")
    public ResponseEntity<List<ChatDto>> getChats() {
        Long currentUserId = userService.getCurrentUserId();
        return ResponseEntity.ok(chatService.getUserChats(currentUserId));
    }

    /**
     * Создает новый приватный чат с указанным пользователем или возвращает существующий.
     *
     * @param userId идентификатор пользователя, с которым создается чат
     * @return DTO созданного или найденного чата
     */
    @PostMapping
    @Operation(summary = "Создать приватный чат", description = "Создает новый приватный чат или возвращает существующий")
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

    /**
     * Возвращает историю сообщений для конкретного чата с поддержкой пагинации.
     *
     * @param chatId идентификатор чата
     * @param page   номер страницы (по умолчанию 0)
     * @param size   размер страницы (по умолчанию 50)
     * @return список DTO сообщений
     */
    @GetMapping("/{chatId}/messages")
    @Operation(summary = "Получить сообщения чата", description = "Возвращает историю сообщений для указанного чата")
    public ResponseEntity<List<MessageDto>> getMessages(
            @PathVariable Long chatId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(chatService.getChatMessages(chatId, page, size));
    }

    /**
     * Отправляет новое сообщение в указанный чат.
     *
     * @param chatId  идентификатор чата
     * @param request объект запроса с текстом и типом сообщения
     * @return DTO созданного сообщения
     */
    @PostMapping("/{chatId}/messages")
    @Operation(summary = "Отправить сообщение", description = "Отправляет новое сообщение (текст, фото, файл или голос) в чат")
    public ResponseEntity<MessageDto> sendMessage(
            @PathVariable Long chatId,
            @RequestBody MessageRequest request) {
        Long currentUserId = userService.getCurrentUserId();
        return ResponseEntity.ok(chatService.sendMessage(
                chatId,
                currentUserId,
                request.getText(),
                MessageType.valueOf(request.getType().toUpperCase()),
                request.getMediaUrl()
        ));
    }

    /**
     * Помечает все сообщения в чате как прочитанные.
     *
     * @param chatId идентификатор чата
     * @return пустой ответ со статусом 200 OK
     */
    @PostMapping("/{chatId}/read")
    @Operation(summary = "Пометить как прочитанное", description = "Сбрасывает счетчик непрочитанных сообщений в чате")
    public ResponseEntity<Void> markAsRead(@PathVariable Long chatId) {
        Long currentUserId = userService.getCurrentUserId();
        chatService.markAsRead(chatId, currentUserId);
        return ResponseEntity.ok().build();
    }

    /**
     * Вспомогательный класс для запроса на отправку сообщения.
     */
    public static class MessageRequest {
        private String text;
        private String type;
        private String mediaUrl;

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getMediaUrl() { return mediaUrl; }
        public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    }
}
