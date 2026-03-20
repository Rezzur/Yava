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

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the currently authenticated user")
    public ResponseEntity<UserSummaryDto> getCurrentUser() {
        return ResponseEntity.ok(userService.toUserSummary(userService.getCurrentUser()));
    }

    @GetMapping("/search")
    @Operation(summary = "Search users", description = "Search users by username, name, or phone")
    public ResponseEntity<List<UserSummaryDto>> searchUsers(
            @RequestParam String query,
            @RequestParam(required = false) Long excludeChatId
    ) {
        Long currentUserId = userService.getCurrentUserId();
        return ResponseEntity.ok(userService.searchUsers(query, currentUserId));
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserSummaryDto> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserSummary(userId));
    }
}
