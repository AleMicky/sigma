package com.endecorani.sigma_api.modules.seguridad.application.service;

import com.endecorani.sigma_api.modules.organizacion.application.dto.response.PersonaResumenResponse;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Persona;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.PersonaRepository;
import com.endecorani.sigma_api.modules.seguridad.application.dto.response.UsuarioResponse;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.UsuarioRolJpaRepository;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "keycloakUserId",
            "username",
            "nombre",
            "email",
            "activo",
            "createdAt",
            "updatedAt"
    );

    private final UsuarioRepository usuarioRepository;
    private final UsuarioRolJpaRepository usuarioRolJpaRepository;
    private final PersonaRepository personaRepository;

    @Transactional(readOnly = true)
    public PageResponse<UsuarioResponse> findAll(PageRequestDto pageRequest) {
        var page = usuarioRepository.findAll(pageRequest.toPageable(SORT_FIELDS));
        return PageResponse.from(page, this::toResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<UsuarioResponse> search(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = com.endecorani.sigma_api.shared.util.StringUtils.normalize(query);

        if (normalized == null) {
            return findAll(pageRequest);
        }

        return PageResponse.from(
                usuarioRepository.search(
                        normalized,
                        pageRequest.toPageable(SORT_FIELDS)
                ),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public UsuarioResponse findById(UUID id) {
        return usuarioRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));
    }

    @Transactional
    public UsuarioResponse actualizarPersona(UUID id, UUID personaId) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        if (personaId != null) {
            if (!personaRepository.existsById(personaId)) {
                throw new ResourceNotFoundException("Persona", personaId);
            }
            if (usuarioRepository.existsByPersonaIdAndIdNot(personaId, id)) {
                throw new ConflictException(
                        "PERSONA_ALREADY_ASSIGNED",
                        "La persona seleccionada ya está asignada a otro usuario"
                );
            }
        }

        usuario.asignarPersona(personaId);
        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        return toResponse(usuarioGuardado);
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        List<String> roles = List.of();
        if (usuario.getId() != null) {
            roles = usuarioRolJpaRepository.findActiveRolesByUsuarioId(usuario.getId())
                    .stream()
                    .map(ur -> ur.getRol().getNombre())
                    .toList();
        }

        PersonaResumenResponse personaResumen = null;
        if (usuario.getPersonaId() != null) {
            personaResumen = personaRepository.findById(usuario.getPersonaId())
                    .map(persona -> new PersonaResumenResponse(
                            persona.getId(),
                            buildNombreCompleto(persona),
                            persona.getTipoDocumento(),
                            persona.getNumeroDocumento()
                    ))
                    .orElse(null);
        }

        return new UsuarioResponse(
                usuario.getId(),
                usuario.getKeycloakUserId(),
                usuario.getUsername(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getPersonaId(),
                personaResumen,
                usuario.isActivo(),
                roles,
                AuditoriaMapper.from(usuario)
        );
    }

    private String buildNombreCompleto(Persona persona) {
        return Stream.of(
                        persona.getNombres(),
                        persona.getPrimerApellido(),
                        persona.getSegundoApellido()
                )
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .collect(Collectors.joining(" "));
    }
}
