package com.ordertracking.initializer;

import com.ordertracking.entity.Role;
import com.ordertracking.entity.RoleName;
import com.ordertracking.entity.User;
import com.ordertracking.repository.RoleRepository;
import com.ordertracking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/** One-time first administrator bootstrap from deployment environment variables. */
@Slf4j
@Component
@Profile("mysql")
@RequiredArgsConstructor
public class MySqlAdminBootstrap implements ApplicationRunner {
    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap-admin.email:}")
    private String email;

    @Value("${app.bootstrap-admin.password:}")
    private String password;

    @Override
    @Transactional
    public void run(org.springframework.boot.ApplicationArguments args) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            log.info("No bootstrap admin configured; set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD for first setup.");
            return;
        }
        if (password.length() < 12) {
            throw new IllegalStateException("BOOTSTRAP_ADMIN_PASSWORD must contain at least 12 characters");
        }

        String normalizedEmail = email.trim().toLowerCase();
        if (users.existsByEmail(normalizedEmail)) {
            log.info("Bootstrap admin already exists; leaving the existing account unchanged.");
            return;
        }

        Role adminRole = roles.findByName(RoleName.ROLE_ADMIN)
                .orElseThrow(() -> new IllegalStateException("ROLE_ADMIN is missing; verify Flyway migrations"));
        users.save(User.builder()
                .email(normalizedEmail)
                .password(passwordEncoder.encode(password))
                .fullName("Application Administrator")
                .enabled(true)
                .roles(Set.of(adminRole))
                .build());
        log.info("Initial administrator account created from bootstrap environment variables. Remove them after first startup.");
    }
}
