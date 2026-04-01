package com.yavimax.messenger.controller;

import com.yavimax.messenger.dto.UserSummaryDto;
import com.yavimax.messenger.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Контроллер для управления данными пользователей.
 * Предоставляет поиск пользователей и доступ к профилю.
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "Управление пользователями")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    /**
     * Выполняет глобальный поиск пользователей по имени, нику или телефону.
     *
     * @param query поисковый запрос
     * @return список найденных пользователей
     */
    @GetMapping("/search")
    @Operation(summary = "Поиск пользователей", description = "Ищет пользователей по частичному совпадению имени, username или телефона")
    public ResponseEntity<List<UserSummaryDto>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }

    /**
     * Возвращает профиль текущего авторизованного пользователя.
     *
     * @return DTO профиля пользователя
     */
    @GetMapping("/profile")
    @Operation(summary = "Профиль текущего пользователя", description = "Возвращает информацию о текущем авторизованном пользователе")
    public ResponseEntity<UserSummaryDto> getProfile() {
        return ResponseEntity.ok(userService.getCurrentUserSummary());
    }

    /**
     * Получает краткую информацию о пользователе по его ID.
     *
     * @param userId идентификатор пользователя
     * @return DTO пользователя
     */
    @GetMapping("/{userId}")
    @Operation(summary = "Получить пользователя по ID")
    public ResponseEntity<UserSummaryDto> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserSummary(userId));
    }
}
