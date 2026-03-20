package com.yavimax.messenger.service;

import com.yavimax.messenger.config.JwtService;
import com.yavimax.messenger.config.UserDetailsImpl;
import com.yavimax.messenger.dto.AuthResponse;
import com.yavimax.messenger.dto.LoginRequest;
import com.yavimax.messenger.dto.RegisterRequest;
import com.yavimax.messenger.entity.User;
import com.yavimax.messenger.exception.AuthException;
import com.yavimax.messenger.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new AuthException("Username already exists");
        }
        
        if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new AuthException("Phone number already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .username(request.getUsername())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();

        User savedUser = userRepository.save(user);

        UserDetailsImpl userDetails = new UserDetailsImpl(savedUser);
        String token = jwtService.generateToken(userDetails);

        return buildAuthResponse(savedUser, token);
    }

    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getIdentifier(),
                    request.getPassword()
                )
            );

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String token = jwtService.generateToken(userDetails);

            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new AuthException("User not found"));

            return buildAuthResponse(user, token);
        } catch (BadCredentialsException e) {
            throw new AuthException("Invalid username/phone or password");
        }
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .username(user.getUsername())
                        .phone(user.getPhone())
                        .avatarUrl(user.getAvatarUrl())
                        .bio(user.getBio())
                        .build())
                .build();
    }
}
