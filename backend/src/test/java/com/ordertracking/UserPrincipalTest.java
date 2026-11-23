package com.ordertracking;

import com.ordertracking.entity.User;
import com.ordertracking.security.UserPrincipal;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;

class UserPrincipalTest {
    @Test
    void disabledDatabaseAccountIsDisabledInSpringSecurityPrincipal() {
        User user = User.builder().id(4L).email("disabled@example.com").enabled(false).build();
        assertFalse(UserPrincipal.create(user).isEnabled());
    }
}
