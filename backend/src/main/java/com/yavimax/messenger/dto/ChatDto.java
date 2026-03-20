package com.yavimax.messenger.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatDto {
    private Long id;
    private String type;
    private String title;
    private String avatarUrl;
    private String lastMessage;
    private Integer unreadCount;
    private String timestamp;
    private Boolean isPinned;
    private UserSummaryDto user;
    private Integer membersCount;
}
