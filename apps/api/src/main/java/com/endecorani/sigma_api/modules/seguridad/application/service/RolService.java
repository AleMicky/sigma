package com.endecorani.sigma_api.modules.seguridad.application.service;

import com.endecorani.sigma_api.modules.seguridad.application.dto.response.RolResponse;
import com.endecorani.sigma_api.modules.seguridad.application.dto.response.UsuarioResponse;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Rol;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.RolRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.UsuarioRolEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.UsuarioRolJpaRepository;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RolService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "keycloakRoleId",
            "codigo",
            "nombre",
            "descripcion",
            "activo",
            "createdAt",
            "updatedAt"
    );

    private final RolRepository rolRepository;
    private final UsuarioRolJpaRepository usuarioRolJpaRepository;

    @Transactional(readOnly = true)
    public PageResponse<RolResponse> findAll(PageRequestDto pageRequest) {
        var page = rolRepository.findAll(pageRequest.toPageable(SORT_FIELDS));
        return PageResponse.from(page, this::toResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<RolResponse> search(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);

        if (normalized == null) {
            return findAll(pageRequest);
        }

        return PageResponse.from(
                rolRepository.search(
                        normalized,
                        pageRequest.toPageable(SORT_FIELDS)
                ),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public List<RolResponse> findAllList() {
        return rolRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RolResponse findById(UUID id) {
        return rolRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Rol", id));
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> obtenerUsuariosPorRol(UUID rolId) {
        validarRolExiste(rolId);
        List<UsuarioRolEntity> usuariosRoles = usuarioRolJpaRepository.findActiveUsuariosByRolId(rolId);
        return usuariosRoles.stream()
                .map(ur -> {
                    var u = ur.getUsuario();
                    return new UsuarioResponse(
                            u.getId(),
                            u.getKeycloakUserId(),
                            u.getUsername(),
                            u.getNombre(),
                            u.getEmail(),
                            u.isActivo(),
                            List.of(ur.getRol().getNombre()),
                            new AuditoriaResponse(
                                    u.getCreatedAt(),
                                    u.getUpdatedAt(),
                                    u.getCreatedBy(),
                                    u.getUpdatedBy()
                            )
                    );
                })
                .toList();
    }

    private void validarRolExiste(UUID rolId) {
        if (rolRepository.findById(rolId).isEmpty()) {
            throw new ResourceNotFoundException("Rol", rolId);
        }
    }

    private RolResponse toResponse(Rol rol) {
        return new RolResponse(
                rol.getId(),
                rol.getKeycloakRoleId(),
                rol.getCodigo(),
                rol.getNombre(),
                rol.getDescripcion(),
                rol.isActivo(),
                AuditoriaMapper.from(rol)
        );
    }
}
