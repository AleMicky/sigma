package com.endecorani.sigma_api.modules.seguridad.application.service;

import com.endecorani.sigma_api.modules.organizacion.domain.model.Persona;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.PersonaRepository;
import com.endecorani.sigma_api.modules.seguridad.application.dto.response.UsuarioResponse;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Rol;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.RolEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.UsuarioEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.UsuarioRolEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.UsuarioRolJpaRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private UsuarioRolJpaRepository usuarioRolJpaRepository;

    @Mock
    private PersonaRepository personaRepository;

    @InjectMocks
    private UsuarioService usuarioService;

    private UUID usuarioId;
    private UUID personaId;
    private Usuario usuario;
    private Persona persona;

    @BeforeEach
    void setUp() {
        usuarioId = UUID.randomUUID();
        personaId = UUID.randomUUID();

        usuario = Usuario.builder()
                .id(usuarioId)
                .keycloakUserId("kc-user-123")
                .username("juan.perez")
                .nombre("Juan")
                .email("juan.perez@example.com")
                .personaId(personaId)
                .activo(true)
                .build();

        persona = Persona.builder()
                .id(personaId)
                .nombres("Juan")
                .primerApellido("Perez")
                .segundoApellido("Gomez")
                .tipoDocumento("CI")
                .numeroDocumento("1234567")
                .build();
    }

    @Test
    @DisplayName("Debe listar usuarios con resolución en lote de roles y persona")
    void debeListarUsuariosConBatchResolution() {
        PageRequestDto pageRequest = new PageRequestDto();

        UsuarioEntity usuarioEntity = new UsuarioEntity();
        usuarioEntity.setId(usuarioId);

        RolEntity rolEntity = new RolEntity();
        rolEntity.setNombre("ADMIN");

        UsuarioRolEntity usuarioRol = new UsuarioRolEntity();
        usuarioRol.setUsuario(usuarioEntity);
        usuarioRol.setRol(rolEntity);
        usuarioRol.setActivo(true);

        when(usuarioRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(usuario)));
        when(usuarioRolJpaRepository.findActiveRolesByUsuarioIdIn(any())).thenReturn(List.of(usuarioRol));
        when(personaRepository.findAllById(any())).thenReturn(List.of(persona));

        PageResponse<UsuarioResponse> response = usuarioService.findAll(pageRequest);

        assertNotNull(response);
        assertEquals(1, response.content().size());
        UsuarioResponse item = response.content().get(0);
        assertEquals("juan.perez", item.username());
        assertEquals(List.of("ADMIN"), item.roles());
        assertNotNull(item.persona());
        assertEquals("Juan Perez Gomez", item.persona().nombreCompleto());
    }

    @Test
    @DisplayName("Debe buscar usuario por ID correctamente")
    void debeBuscarUsuarioPorId() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(personaRepository.findById(personaId)).thenReturn(Optional.of(persona));

        UsuarioResponse response = usuarioService.findById(usuarioId);

        assertNotNull(response);
        assertEquals(usuarioId, response.id());
        assertEquals("juan.perez", response.username());
        assertNotNull(response.persona());
        assertEquals("Juan Perez Gomez", response.persona().nombreCompleto());
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException si el usuario no existe")
    void debeLanzarExcepcionSiUsuarioNoExiste() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> usuarioService.findById(usuarioId));
    }

    @Test
    @DisplayName("Debe actualizar persona asignada a usuario exitosamente")
    void debeActualizarPersonaExitosamente() {
        UUID nuevaPersonaId = UUID.randomUUID();
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(personaRepository.existsById(nuevaPersonaId)).thenReturn(true);
        when(usuarioRepository.existsByPersonaIdAndIdNot(nuevaPersonaId, usuarioId)).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        UsuarioResponse response = usuarioService.actualizarPersona(usuarioId, nuevaPersonaId);

        assertNotNull(response);
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    @DisplayName("Debe fallar al asignar persona si ya está asignada a otro usuario")
    void debeFallarSiPersonaYaEstaAsignada() {
        UUID otraPersonaId = UUID.randomUUID();
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(personaRepository.existsById(otraPersonaId)).thenReturn(true);
        when(usuarioRepository.existsByPersonaIdAndIdNot(otraPersonaId, usuarioId)).thenReturn(true);

        assertThrows(ConflictException.class, () -> usuarioService.actualizarPersona(usuarioId, otraPersonaId));
        verify(usuarioRepository, never()).save(any());
    }
}
