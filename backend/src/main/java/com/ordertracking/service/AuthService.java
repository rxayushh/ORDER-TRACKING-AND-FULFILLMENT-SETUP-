package com.ordertracking.service;

import com.ordertracking.dto.AuthResponse;
import com.ordertracking.dto.LoginRequest;
import com.ordertracking.dto.RegisterRequest;
import com.ordertracking.entity.Role;
import com.ordertracking.entity.RoleName;
import com.ordertracking.entity.User;
import com.ordertracking.exception.BadRequestException;
import com.ordertracking.repository.RoleRepository;
import com.ordertracking.repository.UserRepository;
import com.ordertracking.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("User not found"));

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(roles)
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered: " + email);
        }

        // Public registration must never grant elevated privileges. Staff accounts
        // are provisioned by an administrator through a separate trusted workflow.
        if (request.getRole() != null && !request.getRole().isBlank()) {
            String requested = request.getRole().trim().toUpperCase();
            if (!requested.equals("CUSTOMER") && !requested.equals("ROLE_CUSTOMER")) {
                throw new BadRequestException("Public registration is only available for customer accounts");
            }
        }
        RoleName roleName = RoleName.ROLE_CUSTOMER;

        final RoleName finalRole = roleName;
        Role role = roleRepository.findByName(finalRole)
                .orElseGet(() -> roleRepository.save(Role.builder().name(finalRole).description(finalRole.name()).build()));

        Set<Role> roles = new HashSet<>();
        roles.add(role);

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phoneNumber(request.getPhoneNumber())
                .enabled(true)
                .roles(roles)
                .build();

        user = userRepository.save(user);

        // Auto authenticate on registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(List.of(roleName.name()))
                .build();
    }
}
