package com.ordertracking.controller;

import com.ordertracking.dto.ApiResponse;
import com.ordertracking.dto.AuthResponse;
import com.ordertracking.dto.LoginRequest;
import com.ordertracking.dto.RegisterRequest;
import com.ordertracking.security.UserPrincipal;
import com.ordertracking.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration, login, and profile retrieval")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and return JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a customer account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }

        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toList());

        AuthResponse response = AuthResponse.builder()
                .id(userPrincipal.getId())
                .email(userPrincipal.getEmail())
                .fullName(userPrincipal.getFullName())
                .roles(roles)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
