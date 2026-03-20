package com.yavimax.messenger.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Username or phone is required")
    private String identifier;
    
    @NotBlank(message = "Password is required")
    private String password;
}
