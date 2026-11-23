package com.ordertracking;

import com.ordertracking.entity.User;
import com.ordertracking.security.JwtAuthenticationFilter;
import com.ordertracking.security.JwtTokenProvider;
import com.ordertracking.security.UserDetailsServiceImpl;
import com.ordertracking.security.UserPrincipal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtAuthenticationFilterTest {
    private final JwtTokenProvider tokens = mock(JwtTokenProvider.class);
    private final UserDetailsServiceImpl users = mock(UserDetailsServiceImpl.class);

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void rejectsAnUnexpiredTokenAfterTheAccountIsDisabled() throws Exception {
        when(tokens.validateToken("token-value")).thenReturn(true);
        when(tokens.getUsernameFromJwt("token-value")).thenReturn("disabled@example.com");
        when(users.loadUserByUsername("disabled@example.com")).thenReturn(UserPrincipal.create(
                User.builder().id(1L).email("disabled@example.com").enabled(false).build()));
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-value");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        new JwtAuthenticationFilter(tokens, users).doFilter(request, response, chain);

        assertEquals(401, response.getStatus());
        assertNull(chain.getRequest());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
