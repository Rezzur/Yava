package com.yavimax.messenger.service;

import com.yavimax.messenger.dto.UserSummaryDto;
import com.yavimax.messenger.entity.User;
import com.yavimax.messenger.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Сервис для управления пользователями.
 * Обеспечивает поиск, получение профиля и трансформацию сущностей пользователей в DTO.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Возвращает ID текущего авторизованного пользователя из контекста безопасности.
     *
     * @return идентификатор пользователя
     * @throws RuntimeException если пользователь не найден в контексте
     */
    public Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    /**
     * Получает сводку профиля текущего пользователя.
     *
     * @return DTO пользователя
     */
    public UserSummaryDto getCurrentUserSummary() {
        return getUserSummary(getCurrentUserId());
    }

    /**
     * Ищет пользователей по строковому запросу.
     *
     * @param query имя, ник или телефон
     * @return список DTO найденных пользователей
     */
    public List<UserSummaryDto> searchUsers(String query) {
        Long currentUserId = getCurrentUserId();
        return userRepository.searchUsers(query).stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .map(this::toUserSummary)
                .collect(Collectors.toList());
    }

    /**
     * Получает сводку пользователя по ID.
     *
     * @param userId идентификатор пользователя
     * @return DTO пользователя
     */
    public UserSummaryDto getUserSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toUserSummary(user);
    }

    /**
     * Преобразует сущность User в UserSummaryDto.
     *
     * @param user сущность пользователя
     * @return DTO сводки пользователя
     */
    public UserSummaryDto toUserSummary(User user) {
        if (user == null) return null;
        return UserSummaryDto.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .status(user.getLastSeen() != null && user.getLastSeen().isAfter(java.time.LocalDateTime.now().minusMinutes(5)) ? "online" : "offline")
                .build();
    }
}
