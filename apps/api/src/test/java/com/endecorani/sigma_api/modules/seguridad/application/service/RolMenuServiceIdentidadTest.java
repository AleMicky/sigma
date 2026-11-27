package com.endecorani.sigma_api.modules.seguridad.application.service;

import com.endecorani.sigma_api.modules.seguridad.domain.repository.MenuRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.RolMenuRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.RolRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.RolEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.UsuarioEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.UsuarioRolEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.RolJpaRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.RolMenuJpaRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.UsuarioJpaRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.UsuarioRolJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** REQ-SEG-009/114: búsqueda por sub y authority canónica ROLE_ADMIN. */
@ExtendWith(MockitoExtension.class)
class RolMenuServiceIdentidadTest {

    @Mock
    private RolRepository rolRepository;
    @Mock
    private RolJpaRepository rolJpaRepository;
    @Mock
    private RolMenuRepository rolMenuRepository;
    @Mock
    private RolMenuJpaRepository rolMenuJpaRepository;
    @Mock
    private UsuarioJpaRepository usuarioJpaRepository;
    @Mock
    private UsuarioRolJpaRepository usuarioRolJpaRepository;
    @Mock
    private MenuRepository menuRepository;
    @Mock
    private MenuService menuService;

    private RolMenuService service;

    @BeforeEach
    void setUp() {
        service = new RolMenuService(
                rolRepository, rolJpaRepository, rolMenuRepository, rolMenuJpaRepository,
                usuarioJpaRepository, usuarioRolJpaRepository, menuRepository, menuService);
    }

    @Test
    void subDistintoDePreferredUsername_debeBuscarUsuarioLocalPorKeycloakUserId() {
        UUID usuarioId = UUID.randomUUID();
        UUID rolId = UUID.randomUUID();
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .subject("kc-sub-123")
                .claim("preferred_username", "jdoe")
                .build();
        var authentication = new JwtAuthenticationToken(
                jwt,
                List.of(new SimpleGrantedAuthority("ROLE_OPERADOR")),
                "jdoe");

        UsuarioEntity usuario = mock(UsuarioEntity.class);
        when(usuario.getId()).thenReturn(usuarioId);
        UsuarioRolEntity usuarioRol = mock(UsuarioRolEntity.class);
        RolEntity rol = mock(RolEntity.class);
        when(rol.getId()).thenReturn(rolId);
        when(usuarioRol.getRol()).thenReturn(rol);
        when(usuarioJpaRepository.findByKeycloakUserId("kc-sub-123"))
                .thenReturn(Optional.of(usuario));
        when(usuarioJpaRepository.findByUsernameIgnoreCase("jdoe"))
                .thenReturn(Optional.empty());
        when(usuarioRolJpaRepository.findActiveRolesByUsuarioId(usuarioId))
                .thenReturn(List.of(usuarioRol));

        assertEquals(List.of(), service.obtenerMisMenus(authentication));

        verify(usuarioJpaRepository).findByKeycloakUserId("kc-sub-123");
        verify(usuarioJpaRepository, never()).findByKeycloakUserId("jdoe");
        verify(usuarioJpaRepository).findByUsernameIgnoreCase("jdoe");
    }

    @Test
    void authorityAliasAdmin_noDebeObtenerArbolCompleto() {
        var authentication = new UsernamePasswordAuthenticationToken(
                "admin", "credenciales", List.of(new SimpleGrantedAuthority("ADMIN")));

        assertEquals(List.of(), service.obtenerMisMenus(authentication));
        verify(menuService, never()).buildArbol();
    }

    @Test
    void authorityCanonicaRoleAdmin_debeObtenerArbolCompleto() {
        var authentication = new UsernamePasswordAuthenticationToken(
                "admin", "credenciales", List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        when(menuService.buildArbol()).thenReturn(List.of());

        assertEquals(List.of(), service.obtenerMisMenus(authentication));
        verify(menuService).buildArbol();
    }
}
