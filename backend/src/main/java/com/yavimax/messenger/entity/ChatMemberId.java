package com.yavimax.messenger.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMemberId implements Serializable {
    private Long chatId;
    private Long userId;
}
