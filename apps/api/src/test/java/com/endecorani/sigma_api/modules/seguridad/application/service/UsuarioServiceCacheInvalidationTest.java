package com.endecorani.sigma_api.modules.seguridad.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.PersonaRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.UsuarioRolJpaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** REQ-SEG-009: actualizar la persona debe refrescar la caché de resolución de usuario. */
@ExtendWith(MockitoExtension.class)
class UsuarioServiceCacheInvalidationTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private UsuarioRolJpaRepository usuarioRolJpaRepository;
    @Mock
    private PersonaRepository personaRepository;
    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private UsuarioService service;

    @Test
    void actualizarPersona_debeInvalidarCachePorKeycloakIdYUsername() {
        UUID id = UUID.randomUUID();
        Usuario usuario = Usuario.builder()
                .id(id)
                .keycloakUserId("kc-sub-123")
                .username("jdoe")
                .build();
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(usuario)).thenReturn(usuario);
        when(usuarioRolJpaRepository.findActiveRolesByUsuarioId(id)).thenReturn(List.of());

        service.actualizarPersona(id, null);

        verify(securityUtils).invalidateUser("kc-sub-123", "jdoe");
    }
}
