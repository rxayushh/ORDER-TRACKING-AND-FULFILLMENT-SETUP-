package com.ordertracking;

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
import com.ordertracking.security.UserPrincipal;
import com.ordertracking.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mock;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private Role customerRole;

    @BeforeEach
    void setUp() {
        customerRole = Role.builder().id(1L).name(RoleName.ROLE_CUSTOMER).description("Customer").build();
        sampleUser = User.builder()
                .id(10L)
                .email("test@example.com")
                .password("encoded_pass")
                .fullName("Test User")
                .roles(Set.of(customerRole))
                .build();
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("test@example.com", "Password@123");
        Authentication auth = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mocked.jwt.token");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals("test@example.com", response.getEmail());
        assertTrue(response.getRoles().contains("ROLE_CUSTOMER"));
    }

    @Test
    void testRegisterDuplicateEmailThrowsException() {
        RegisterRequest request = RegisterRequest.builder()
                .email("test@example.com")
                .password("Secret@123")
                .fullName("Duplicate User")
                .build();

        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
    }

    @Test
    void testRegisterRejectsPublicAdminRole() {
        RegisterRequest request = RegisterRequest.builder()
                .email("new-admin@example.com")
                .password("Secret@123")
                .fullName("Not An Admin")
                .role("ADMIN")
                .build();

        when(userRepository.existsByEmail("new-admin@example.com")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void testRegisterRejectsPublicWarehouseManagerRole() {
        RegisterRequest request = RegisterRequest.builder()
                .email("new-manager@example.com")
                .password("Secret@123")
                .fullName("Not A Manager")
                .role("WAREHOUSE_MANAGER")
                .build();

        when(userRepository.existsByEmail("new-manager@example.com")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }
}
