package com.endecorani.sigma_api.modules.seguridad.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Rol;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.KeycloakUsuarioProvider;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.RolEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.UsuarioEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.UsuarioRolEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.RolJpaRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.UsuarioJpaRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.UsuarioRolJpaRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** REQ-SEG-002: fallo de Keycloak ≠ usuario sin roles. */
@ExtendWith(MockitoExtension.class)
class UsuarioSyncServiceRolesTest {

    @Mock
    private KeycloakUsuarioProvider keycloakUsuarioProvider;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private UsuarioJpaRepository usuarioJpaRepository;
    @Mock
    private RolJpaRepository rolJpaRepository;
    @Mock
    private UsuarioRolJpaRepository usuarioRolJpaRepository;
    @Mock
    private RolSyncService rolSyncService;
    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private UsuarioSyncService service;

    @Test
    void sincronizarTodos_keycloakFallaAlConsultarRoles_debeFallar422SinDesactivarRolesLocales() {
        UUID usuarioId = UUID.randomUUID();
        Usuario usuario = usuario(usuarioId);
        UsuarioRolEntity rolLocal = usuarioRol("OPERADOR", true);
        prepararUsuarioLocal(usuario);
        when(keycloakUsuarioProvider.obtenerRolesDeUsuario("kc-1"))
                .thenThrow(new BusinessException(
                        "KEYCLOAK_SYNC_ERROR", "Error al sincronizar roles desde Keycloak (500)"));

        BusinessException ex = assertThrows(BusinessException.class, () -> service.sincronizarTodos());

        assertEquals("KEYCLOAK_SYNC_ERROR", ex.getCode());
        assertTrue(rolLocal.isActivo());
        verify(usuarioRolJpaRepository, never()).findByUsuarioId(any());
        verify(usuarioRolJpaRepository, never()).save(any());
    }

    @Test
    void sincronizarTodos_rolesPresentesEnKeycloak_debeDesactivarSoloRolesAusentes() {
        UUID usuarioId = UUID.randomUUID();
        Usuario usuario = usuario(usuarioId);
        UsuarioRolEntity rolPresente = usuarioRol("OPERADOR", true);
        UsuarioRolEntity rolAusente = usuarioRol("SUPERVISOR", true);
        prepararUsuarioLocal(usuario);
        when(usuarioRolJpaRepository.findByUsuarioId(usuarioId)).thenReturn(List.of(rolPresente, rolAusente));
        when(keycloakUsuarioProvider.obtenerRolesDeUsuario("kc-1"))
                .thenReturn(List.of(Rol.builder()
                        .keycloakRoleId("kc-role-operador")
                        .codigo("OPERADOR")
                        .build()));
        when(rolJpaRepository.findByKeycloakRoleId("kc-role-operador"))
                .thenReturn(Optional.of(rolPresente.getRol()));

        int sincronizados = service.sincronizarTodos();

        assertEquals(1, sincronizados);
        assertTrue(rolPresente.isActivo());
        assertFalse(rolAusente.isActivo());
        verify(usuarioRolJpaRepository, times(1)).save(rolAusente);
        verify(usuarioRolJpaRepository, never()).save(rolPresente);
    }

    @Test
    void sincronizarTodos_keycloakRespondioSinRoles_debeDesactivarRolesComoSyncLegitimo() {
        UUID usuarioId = UUID.randomUUID();
        Usuario usuario = usuario(usuarioId);
        UsuarioRolEntity rolUno = usuarioRol("OPERADOR", true);
        UsuarioRolEntity rolDos = usuarioRol("SUPERVISOR", true);
        prepararUsuarioLocal(usuario);
        when(usuarioRolJpaRepository.findByUsuarioId(usuarioId)).thenReturn(List.of(rolUno, rolDos));
        when(keycloakUsuarioProvider.obtenerRolesDeUsuario("kc-1")).thenReturn(List.of());

        assertEquals(1, service.sincronizarTodos());

        assertFalse(rolUno.isActivo());
        assertFalse(rolDos.isActivo());
        verify(usuarioRolJpaRepository, times(1)).save(rolUno);
        verify(usuarioRolJpaRepository, times(1)).save(rolDos);
    }

    @Test
    void sincronizarTodos_usuarioDesactivado_debeInvalidarCacheDeResolucion() {
        Usuario usuario = usuario(UUID.randomUUID());
        prepararUsuarioLocal(usuario);
        when(usuarioRolJpaRepository.findByUsuarioId(usuario.getId())).thenReturn(List.of());
        when(keycloakUsuarioProvider.obtenerRolesDeUsuario("kc-1")).thenReturn(List.of());

        assertEquals(1, service.sincronizarTodos());

        verify(securityUtils).invalidateUser("kc-1", "jdoe");
    }

    private void prepararUsuarioLocal(Usuario usuario) {
        when(keycloakUsuarioProvider.obtenerTodos()).thenReturn(List.of(usuario));
        when(usuarioRepository.findByKeycloakUserId("kc-1")).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(usuario)).thenReturn(usuario);
        when(usuarioJpaRepository.findById(usuario.getId()))
                .thenReturn(Optional.of(UsuarioEntity.builder().id(usuario.getId()).build()));
    }

    private Usuario usuario(UUID usuarioId) {
        return Usuario.builder()
                .id(usuarioId)
                .keycloakUserId("kc-1")
                .username("jdoe")
                .build();
    }

    private RolEntity rolEntity(String keycloakRoleId, String codigo) {
        return RolEntity.builder()
                .id(UUID.randomUUID())
                .keycloakRoleId(keycloakRoleId)
                .codigo(codigo)
                .build();
    }

    private UsuarioRolEntity usuarioRol(String codigo, boolean activo) {
        return UsuarioRolEntity.builder()
                .id(UUID.randomUUID())
                .rol(rolEntity("kc-role-" + codigo.toLowerCase(), codigo))
                .activo(activo)
                .build();
    }
}
