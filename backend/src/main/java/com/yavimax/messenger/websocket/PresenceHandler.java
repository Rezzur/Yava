package com.yavimax.messenger.websocket;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.yavimax.messenger.config.UserDetailsImpl;
import com.yavimax.messenger.dto.UserSummaryDto;
import com.yavimax.messenger.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class PresenceHandler {

    private static final String PRESENCE_KEY_PREFIX = "presence:user:";
    private static final Duration PRESENCE_TTL = Duration.ofMinutes(5);
    private static final String PRESENCE_TOPIC = "/topic/presence";

    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserService userService;

    private final Map<String, Long> sessionUserMap = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        
        if (sessionId == null) {
            return;
        }

        try {
            Long userId = extractUserIdFromPrincipal(headerAccessor);
            if (userId != null) {
                handleUserConnect(sessionId, userId);
            }
        } catch (Exception e) {
            log.error("Error handling WebSocket connection: {}", e.getMessage(), e);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        
        if (sessionId == null) {
            return;
        }

        Long userId = sessionUserMap.remove(sessionId);
        if (userId != null) {
            handleUserDisconnect(userId);
        }
    }

    public void handleUserConnect(String sessionId, Long userId) {
        sessionUserMap.put(sessionId, userId);
        setUserOnlineStatus(userId, true);
        broadcastPresenceUpdate(userId, true);
        log.info("User {} connected with session {}", userId, sessionId);
    }

    public void handleUserDisconnect(Long userId) {
        boolean hasOtherSessions = sessionUserMap.values().contains(userId);
        
        if (!hasOtherSessions) {
            setUserOnlineStatus(userId, false);
            broadcastPresenceUpdate(userId, false);
            log.info("User {} disconnected", userId);
        } else {
            log.debug("User {} has other active sessions, remaining online", userId);
        }
    }

    public void refreshPresence(Long userId) {
        if (isUserOnline(userId)) {
            redisTemplate.opsForValue().set(
                    PRESENCE_KEY_PREFIX + userId,
                    LocalDateTime.now().toString(),
                    PRESENCE_TTL
            );
        }
    }

    public boolean isUserOnline(Long userId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(PRESENCE_KEY_PREFIX + userId));
    }

    public Set<Long> getOnlineUsers() {
        Set<String> keys = redisTemplate.keys(PRESENCE_KEY_PREFIX + "*");
        if (keys == null || keys.isEmpty()) {
            return Set.of();
        }
        
        return keys.stream()
                .map(key -> {
                    try {
                        String userIdStr = key.replace(PRESENCE_KEY_PREFIX, "");
                        return Long.parseLong(userIdStr);
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .filter(id -> id != null)
                .collect(java.util.stream.Collectors.toSet());
    }

    private void setUserOnlineStatus(Long userId, boolean online) {
        String key = PRESENCE_KEY_PREFIX + userId;
        if (online) {
            redisTemplate.opsForValue().set(key, LocalDateTime.now().toString(), PRESENCE_TTL);
        } else {
            redisTemplate.delete(key);
        }
    }

    private void broadcastPresenceUpdate(Long userId, boolean online) {
        try {
            UserSummaryDto userSummary = userService.getUserSummary(userId);
            
            PresenceUpdate presenceUpdate = new PresenceUpdate(
                    userId,
                    userSummary.getName(),
                    userSummary.getAvatarUrl(),
                    online ? "online" : "offline",
                    LocalDateTime.now()
            );

            messagingTemplate.convertAndSend(PRESENCE_TOPIC, presenceUpdate);
            log.debug("Broadcast presence update for user {}: {}", userId, online ? "online" : "offline");
            
        } catch (Exception e) {
            log.error("Error broadcasting presence update for user {}: {}", userId, e.getMessage());
            PresenceUpdate presenceUpdate = new PresenceUpdate(
                    userId, null, null, online ? "online" : "offline", LocalDateTime.now()
            );
            messagingTemplate.convertAndSend(PRESENCE_TOPIC, presenceUpdate);
        }
    }

    private Long extractUserIdFromPrincipal(StompHeaderAccessor headerAccessor) {
        Object principal = headerAccessor.getUser();
        
        if (principal == null) {
            return null;
        }

        if (principal instanceof UserDetailsImpl userDetails) {
            return userDetails.getId();
        }
        
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            Object authPrincipal = auth.getPrincipal();
            if (authPrincipal instanceof UserDetailsImpl userDetails) {
                return userDetails.getId();
            }
        }
        
        if (principal instanceof String userIdStr) {
            try {
                return Long.parseLong(userIdStr);
            } catch (NumberFormatException e) {
                log.warn("Could not parse user ID from principal: {}", userIdStr);
            }
        }

        return null;
    }

    public int getActiveSessionCount(Long userId) {
        return (int) sessionUserMap.values().stream()
                .filter(id -> id.equals(userId))
                .count();
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record PresenceUpdate(
            Long userId,
            String name,
            String avatarUrl,
            String status,
            LocalDateTime timestamp
    ) {}
}
