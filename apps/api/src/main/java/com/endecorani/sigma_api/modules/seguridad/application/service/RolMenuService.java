package com.endecorani.sigma_api.modules.seguridad.application.service;

import com.endecorani.sigma_api.modules.seguridad.application.dto.request.AsignarMenusRolRequest;
import com.endecorani.sigma_api.modules.seguridad.application.dto.response.MenuResponse;
import com.endecorani.sigma_api.modules.seguridad.application.dto.response.MenuTreeNode;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Menu;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.MenuRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.RolMenuRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.RolRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.RolEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.RolMenuEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.UsuarioRolEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.RolJpaRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.RolMenuJpaRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.UsuarioJpaRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.UsuarioRolJpaRepository;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RolMenuService {

    private final RolRepository rolRepository;
    private final RolJpaRepository rolJpaRepository;
    private final RolMenuRepository rolMenuRepository;
    private final RolMenuJpaRepository rolMenuJpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final UsuarioRolJpaRepository usuarioRolJpaRepository;
    private final MenuRepository menuRepository;
    private final MenuService menuService;

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

    @Transactional(readOnly = true)
    public List<MenuTreeNode> obtenerMisMenus(Authentication authentication) {
        if (authentication == null) {
            return List.of();
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_ADMIN")
                        || a.getAuthority().equalsIgnoreCase("ADMIN"));

        Set<UUID> rolIds = new HashSet<>();

        // 1. Roles provenientes del token JWT / authorities
        List<String> roleCodes = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.toUpperCase().startsWith("ROLE_") ? auth.substring(5) : auth)
                .filter(code -> !code.isBlank())
                .toList();

        if (!roleCodes.isEmpty()) {
            List<RolEntity> rolesByCode = rolJpaRepository.findByCodigoIgnoreCaseIn(roleCodes);
            rolesByCode.forEach(r -> rolIds.add(r.getId()));
        }

        // 2. Roles asignados en base de datos local (Usuario -> UsuarioRol)
        String principalName = authentication.getName();
        if (principalName != null && !principalName.isBlank()) {
            usuarioJpaRepository.findByKeycloakUserId(principalName)
                    .ifPresent(usuario -> {
                        List<UsuarioRolEntity> userRoles = usuarioRolJpaRepository
                                .findActiveRolesByUsuarioId(usuario.getId());
                        userRoles.forEach(ur -> rolIds.add(ur.getRol().getId()));
                    });
            usuarioJpaRepository.findByUsernameIgnoreCase(principalName)
                    .ifPresent(usuario -> {
                        List<UsuarioRolEntity> userRoles = usuarioRolJpaRepository
                                .findActiveRolesByUsuarioId(usuario.getId());
                        userRoles.forEach(ur -> rolIds.add(ur.getRol().getId()));
                    });
        }

        if (rolIds.isEmpty()) {
            if (isAdmin) {
                return menuService.buildArbol();
            }
            return List.of();
        }

        List<RolMenuEntity> rolesMenus = rolMenuJpaRepository.findByRolIdIn(new ArrayList<>(rolIds));
        if (rolesMenus.isEmpty()) {
            if (isAdmin) {
                return menuService.buildArbol();
            }
            return List.of();
        }

        Set<UUID> menuIds = rolesMenus.stream()
                .map(rm -> rm.getMenu().getId())
                .collect(Collectors.toSet());

        List<Menu> allMenus = menuRepository.findAll();
        Map<UUID, Menu> allMenusById = allMenus.stream()
                .collect(Collectors.toMap(Menu::getId, m -> m));

        Set<Menu> assignedWithAncestors = new HashSet<>();
        for (UUID menuId : menuIds) {
            Menu current = allMenusById.get(menuId);
            while (current != null) {
                if (current.isActivo()) {
                    assignedWithAncestors.add(current);
                }
                current = current.getMenuPadreId() != null
                        ? allMenusById.get(current.getMenuPadreId())
                        : null;
            }
        }

        // Asegurar que el menú de Inicio esté siempre accesible si existe en el sistema
        allMenus.stream()
                .filter(m -> "MOD_INICIO".equalsIgnoreCase(m.getCodigo())
                        || "MENU_INICIO".equalsIgnoreCase(m.getCodigo()))
                .forEach(assignedWithAncestors::add);

        return menuService.buildArbolFromMenus(new ArrayList<>(assignedWithAncestors));
    }

    private void validarRolExiste(UUID rolId) {
        if (rolRepository.findById(rolId).isEmpty()) {
            throw new ResourceNotFoundException("Rol", rolId);
        }
    }
}
