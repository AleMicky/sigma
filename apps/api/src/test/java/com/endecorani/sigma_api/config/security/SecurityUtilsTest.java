package com.endecorani.sigma_api.config.security;

import com.endecorani.sigma_api.modules.organizacion.application.service.EmpleadoInfoResolver;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskResponse;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowCompletionGuard;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowEngineService;
import com.endecorani.sigma_api.shared.domain.exception.ForbiddenException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
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
    @Mock
    private EmpleadoInfoResolver empleadoInfoResolver;
    @Mock
    private WorkflowEngineService workflowEngineService;

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

    @Test
    void isAdmin_preferredUsernameAdminConRoleOperador_debeRetornarFalse() {
        setJwtAuthentication("kc-sub-admin", "admin",
                List.of(new SimpleGrantedAuthority("ROLE_OPERADOR")));

        assertFalse(securityUtils.isAdmin());
    }

    @Test
    void isAdmin_conRoleAdmin_debeRetornarTrue() {
        setJwtAuthentication("kc-sub-user", "jdoe",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        assertTrue(securityUtils.isAdmin());
    }

    @Test
    void isAdmin_sinAutenticacion_debeRetornarFalse() {
        SecurityContextHolder.clearContext();

        assertFalse(securityUtils.isAdmin());
    }

    @Test
    void workflowCompletionGuard_actorLlamadoAdminSinRoleAdmin_noDebeObtenerBypass() {
        UUID actorId = UUID.randomUUID();
        UUID responsableTarea = UUID.randomUUID();
        setJwtAuthentication("kc-sub-admin", "admin",
                List.of(new SimpleGrantedAuthority("ROLE_OPERADOR")));
        when(workflowEngineService.obtenerDefinitionKey("proc-1"))
                .thenReturn(WorkflowCompletionGuard.MANTENIMIENTOS_DEFINITION_KEY);
        when(workflowEngineService.obtenerTareaActual("proc-1"))
                .thenReturn(new WorkflowTaskResponse(
                        "task-1", "Revisar", "revisarSolicitud", responsableTarea.toString(),
                        "proc-1", "def-1"));
        when(empleadoInfoResolver.resolveCurrentEmpleadoId()).thenReturn(Optional.of(actorId));

        WorkflowCompletionGuard guardia = new WorkflowCompletionGuard(
                securityUtils, empleadoInfoResolver, workflowEngineService);

        assertFalse(securityUtils.isAdmin());
        ForbiddenException ex = assertThrows(ForbiddenException.class,
                () -> guardia.validar("proc-1", Map.of("actorId", actorId.toString())));
        assertTrue(ex.getMessage().contains("asignada a otro usuario"));
    }

    private void setJwtAuthentication(String subject, String preferredUsername) {
        setJwtAuthentication(subject, preferredUsername, List.of());
    }

    private void setJwtAuthentication(String subject, String preferredUsername,
                                      List<GrantedAuthority> authorities) {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .subject(subject)
                .claim("preferred_username", preferredUsername)
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new JwtAuthenticationToken(jwt, authorities, preferredUsername));
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
