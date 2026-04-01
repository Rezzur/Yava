package com.yavimax.messenger.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) для представления информации о чате.
 * <p>
 * Содержит агрегированные данные, необходимые для отображения элемента списка чатов
 * на стороне клиентского приложения (идентификатор, тип, название, последнее сообщение и статистика).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatDto {

    /**
     * Уникальный идентификатор чата.
     */
    private Long id;

    /**
     * Тип чата (например, "PRIVATE" для личных сообщений, "GROUP" для бесед).
     */
    private String type;

    /**
     * Название чата (для групп) или имя собеседника (для личных переписок).
     */
    private String title;

    /**
     * URL-адрес изображения профиля/аватарки чата.
     */
    private String avatarUrl;

    /**
     * Текст последнего отправленного в чат сообщения для предпросмотра.
     */
    private String lastMessage;

    /**
     * Количество непрочитанных сообщений в данном чате для текущего пользователя.
     */
    private Integer unreadCount;

    /**
     * Время последней активности или отправки последнего сообщения.
     */
    private String timestamp;

    /**
     * Флаг, определяющий, закреплен ли чат в верхней части списка контактов.
     */
    private Boolean isPinned;

    /**
     * Краткая информация о собеседнике (заполняется преимущественно для личных чатов).
     */
    private UserSummaryDto user;

    /**
     * Общее количество участников (заполняется для групповых чатов).
     */
    private Integer membersCount;
}