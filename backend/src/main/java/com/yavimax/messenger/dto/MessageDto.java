package com.yavimax.messenger.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private Long id;
    private Long chatId;
    private UserSummaryDto sender;
    private String text;
    private String type;
    private String mediaUrl;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private String timestamp;
}
