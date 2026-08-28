package com.endecorani.sigma_api.modules.seguridad.application.service;

import com.endecorani.sigma_api.modules.seguridad.application.dto.response.UsuarioResponse;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.UsuarioRolJpaRepository;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

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

    private UsuarioResponse toResponse(Usuario usuario) {
        List<String> roles = List.of();
        if (usuario.getId() != null) {
            roles = usuarioRolJpaRepository.findActiveRolesByUsuarioId(usuario.getId())
                    .stream()
                    .map(ur -> ur.getRol().getNombre())
                    .toList();
        }

        return new UsuarioResponse(
                usuario.getId(),
                usuario.getKeycloakUserId(),
                usuario.getUsername(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.isActivo(),
                roles,
                AuditoriaMapper.from(usuario)
        );
    }
}
