package com.teamflow.service;

import com.teamflow.dto.Dtos.*;
import com.teamflow.model.User;
import com.teamflow.repository.UserRepository;
import com.teamflow.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtils jwtUtils;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email)) {
            throw new IllegalArgumentException("Email already registered.");
        }
        User user = User.builder()
                .name(req.name)
                .email(req.email)
                .passwordHash(passwordEncoder.encode(req.password))
                .role(User.Role.USER)
                .active(true)
                .build();
        user = userRepository.save(user);
        String token = generateToken(user.getEmail());
        return new AuthResponse(token, toResponse(user));
    }

    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.email, req.password));
        User user = userRepository.findByEmail(req.email).orElseThrow();
        String token = generateToken(user.getEmail());
        return new AuthResponse(token, toResponse(user));
    }

    private String generateToken(String email) {
        UserDetails details = userDetailsService.loadUserByUsername(email);
        return jwtUtils.generateToken(details);
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.isActive(), u.getCreatedAt());
    }
}
