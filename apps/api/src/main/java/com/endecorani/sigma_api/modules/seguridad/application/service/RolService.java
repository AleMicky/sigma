package com.endecorani.sigma_api.modules.seguridad.application.service;

import com.endecorani.sigma_api.modules.seguridad.application.dto.request.AsignarMenusRolRequest;
import com.endecorani.sigma_api.modules.seguridad.application.dto.response.MenuResponse;
import com.endecorani.sigma_api.modules.seguridad.application.dto.response.MenuTreeNode;
import com.endecorani.sigma_api.modules.seguridad.application.dto.response.RolResponse;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Menu;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Rol;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.MenuRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.RolMenuRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.RolRepository;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
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
    private final RolMenuRepository rolMenuRepository;
    private final MenuRepository menuRepository;
    private final MenuService menuService;

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
    public List<UUID> obtenerMenuIdsPorRol(UUID rolId) {
        validarRolExiste(rolId);
        return rolMenuRepository.findMenuIdsByRolId(rolId);
    }

    @Transactional(readOnly = true)
    public List<MenuResponse> obtenerMenusPorRol(UUID rolId) {
        validarRolExiste(rolId);
        List<UUID> menuIds = rolMenuRepository.findMenuIdsByRolId(rolId);
        if (menuIds.isEmpty()) {
            return List.of();
        }
        List<Menu> menus = menuRepository.findAllById(menuIds);
        return menus.stream()
                .map(menuService::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MenuTreeNode> obtenerArbolMenusPorRol(UUID rolId) {
        validarRolExiste(rolId);
        List<UUID> menuIds = rolMenuRepository.findMenuIdsByRolId(rolId);
        if (menuIds.isEmpty()) {
            return List.of();
        }
        List<Menu> menus = menuRepository.findAllById(menuIds);
        return menuService.buildArbolFromMenus(menus);
    }

    @Transactional
    public List<UUID> asignarMenus(UUID rolId, AsignarMenusRolRequest request) {
        validarRolExiste(rolId);

        List<UUID> menuIds = request.getMenuIds() != null
                ? request.getMenuIds().stream()
                        .filter(Objects::nonNull)
                        .distinct()
                        .toList()
                : List.of();

        for (UUID menuId : menuIds) {
            if (!menuRepository.existsById(menuId)) {
                throw new ResourceNotFoundException("Menú", menuId);
            }
        }

        rolMenuRepository.asignarMenusARol(rolId, menuIds);
        return menuIds;
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
