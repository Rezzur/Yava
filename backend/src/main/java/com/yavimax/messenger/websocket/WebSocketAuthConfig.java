package com.yavimax.messenger.websocket;

import com.yavimax.messenger.config.JwtService;
import com.yavimax.messenger.config.UserDetailsImpl;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.util.StringUtils;

import java.util.List;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthConfig {

    private final JwtService jwtService;

    @org.springframework.stereotype.Component
    public static class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

        private final JwtService jwtService;

        public WebSocketAuthChannelInterceptor(JwtService jwtService) {
            this.jwtService = jwtService;
        }

        @Override
        public Message<?> preSend(Message<?> message, MessageChannel channel) {
            StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

            if (accessor == null) {
                return message;
            }

            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                String token = extractToken(accessor);

                if (token == null || !jwtService.validateToken(token)) {
                    log.warn("Invalid or missing JWT token for WebSocket connection");
                    return message;
                }

                try {
                    String username = jwtService.extractUsername(token);
                    UserDetailsImpl userDetails = UserDetailsImpl.builder()
                            .id(1L)
                            .username(username)
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))
                            .build();

                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_USER"))
                    );

                    accessor.setUser(auth);
                    log.info("WebSocket authenticated user: {}", username);

                } catch (Exception e) {
                    log.warn("JWT token validation failed: {}", e.getMessage());
                }
            }

            return message;
        }

        private String extractToken(StompHeaderAccessor accessor) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                return authHeader.substring(7);
            }
            String token = accessor.getFirstNativeHeader("token");
            if (StringUtils.hasText(token)) {
                return token;
            }
            return null;
        }
    }

    public static class WebSocketHandshakeInterceptor implements HandshakeInterceptor {

        private final JwtService jwtService;

        public WebSocketHandshakeInterceptor(JwtService jwtService) {
            this.jwtService = jwtService;
        }

        @Override
        public boolean beforeHandshake(ServerHttpRequest request,
                                       ServerHttpResponse response,
                                       WebSocketHandler wsHandler,
                                       java.util.Map<String, Object> attributes) throws Exception {
            String token = extractToken(request);

            if (token == null || !jwtService.validateToken(token)) {
                log.warn("Invalid token in WebSocket handshake");
                return true;
            }

            try {
                String username = jwtService.extractUsername(token);
                attributes.put("username", username);
                log.debug("Handshake successful for user: {}", username);
                return true;
            } catch (Exception e) {
                log.warn("Token validation failed during handshake: {}", e.getMessage());
                return true;
            }
        }

        @Override
        public void afterHandshake(ServerHttpRequest request,
                                  ServerHttpResponse response,
                                  WebSocketHandler wsHandler,
                                  Exception exception) {
        }

        private String extractToken(ServerHttpRequest request) {
            if (request.getURI() != null && request.getURI().getQuery() != null) {
                String query = request.getURI().getQuery();
                for (String param : query.split("&")) {
                    String[] parts = param.split("=", 2);
                    if (parts.length == 2 && "token".equals(parts[0])) {
                        return parts[1];
                    }
                }
            }
            return null;
        }
    }
}
