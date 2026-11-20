package com.endecorani.sigma_api.config.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SecurityUtilsTest {

    @Mock
    private JdbcClient jdbcClient;
    @Mock
    private JdbcClient.StatementSpec statementSpec;
    @Mock
    private JdbcClient.MappedQuerySpec<UUID> mappedQuerySpec;

    private MutableClock clock;
    private SecurityUtils securityUtils;

    @BeforeEach
    void setUp() {
        clock = new MutableClock(Instant.parse("2026-11-20T00:00:00Z"));
        securityUtils = new SecurityUtils(jdbcClient, clock, Duration.ofMinutes(5));
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getCurrentUserId_cachesWithinTtl_andRefreshesAfterExpiration() {
        UUID firstUserId = UUID.randomUUID();
        UUID updatedUserId = UUID.randomUUID();
        setJwtAuthentication("kc-sub-1", "jdoe");

        when(jdbcClient.sql(anyString())).thenReturn(statementSpec);
        when(statementSpec.param(anyString(), anyString())).thenReturn(statementSpec);
        when(statementSpec.query(UUID.class)).thenReturn(mappedQuerySpec);
        when(mappedQuerySpec.optional())
                .thenReturn(Optional.of(firstUserId))
                .thenReturn(Optional.of(updatedUserId));

        // Primera consulta: va a BD
        assertEquals(Optional.of(firstUserId), securityUtils.getCurrentUserId());
        // Dentro del TTL (4 min): responde desde caché sin consultar BD
        clock.advance(Duration.ofMinutes(4));
        assertEquals(Optional.of(firstUserId), securityUtils.getCurrentUserId());
        verify(jdbcClient, times(1)).sql(anyString());

        // Al vencer el TTL (5+ min): reconsulta BD
        clock.advance(Duration.ofMinutes(2));
        assertEquals(Optional.of(updatedUserId), securityUtils.getCurrentUserId());
        verify(jdbcClient, times(2)).sql(anyString());
    }

    @Test
    void invalidateUser_evictsSpecificUserBeforeTtl() {
        UUID userId = UUID.randomUUID();
        setJwtAuthentication("kc-sub-2", "mgarcia");

        when(jdbcClient.sql(anyString())).thenReturn(statementSpec);
        when(statementSpec.param(anyString(), anyString())).thenReturn(statementSpec);
        when(statementSpec.query(UUID.class)).thenReturn(mappedQuerySpec);
        when(mappedQuerySpec.optional()).thenReturn(Optional.of(userId));

        assertTrue(securityUtils.getCurrentUserId().isPresent());
        securityUtils.invalidateUser("kc-sub-2", "mgarcia");
        assertTrue(securityUtils.getCurrentUserId().isPresent());

        verify(jdbcClient, times(2)).sql(anyString());
    }

    private void setJwtAuthentication(String subject, String preferredUsername) {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .subject(subject)
                .claim("preferred_username", preferredUsername)
                .build();
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt, List.of()));
    }

    private static final class MutableClock extends Clock {
        private Instant current;

        private MutableClock(Instant initial) {
            this.current = initial;
        }

        void advance(Duration duration) {
            this.current = this.current.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return current;
        }
    }
}
