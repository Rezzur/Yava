package com.yavimax.messenger.config;

import com.yavimax.messenger.websocket.WebSocketAuthConfig.WebSocketHandshakeInterceptor;
import com.yavimax.messenger.websocket.WebSocketAuthConfig.WebSocketAuthChannelInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Конфигурационный класс для настройки WebSocket и STOMP-маршрутизации.
 * <p>
 * Отвечает за регистрацию эндпоинтов, настройку брокера сообщений и
 * подключение интерцепторов для проверки JWT-токенов как на этапе
 * установки соединения (handshake), так и при передаче STOMP-сообщений.
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final WebSocketAuthChannelInterceptor channelInterceptor;

    /**
     * Настраивает брокер сообщений.
     * Определяет префиксы для маршрутизации сообщений между клиентами и сервером.
     *
     * @param config реестр для настройки брокера сообщений
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Включает простой брокер в памяти для обработки подписок (топики и очереди)
        config.enableSimpleBroker("/queue", "/topic");
        // Префикс для входящих сообщений, которые обрабатываются методами с @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
        // Префикс для адресации приватных сообщений конкретному пользователю
        config.setUserDestinationPrefix("/user");
    }

    /**
     * Настраивает входящий канал для сообщений от клиентов.
     * <p>
     * Подключает интерцептор для извлечения и валидации JWT-токена из заголовков
     * при отправке STOMP-кадров (например, CONNECT, SUBSCRIBE, SEND).
     *
     * @param registration объект для регистрации интерцепторов в канале
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(channelInterceptor);
    }

    /**
     * Регистрирует STOMP-эндпоинты, к которым будут подключаться клиенты.
     * Настраивает CORS и добавляет интерцептор для HTTP-рукопожатия.
     *
     * @param registry реестр STOMP-эндпоинтов
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        WebSocketHandshakeInterceptor authInterceptor = new WebSocketHandshakeInterceptor(jwtService);

        // Эндпоинт с поддержкой SockJS (для старых клиентов или обхода блокировок)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(authInterceptor)
                .withSockJS();

        // Стандартный WebSocket эндпоинт (нативный)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(authInterceptor);
    }
}