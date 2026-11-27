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
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
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

    /**
     * REQ-SEG-007: {@code menuIds} ausente o {@code null} es inválido y NO modifica las
     * asignaciones existentes. La lista vacía {@code []} es una limpieza explícita.
     */
    @Transactional
    public List<UUID> asignarMenus(UUID rolId, AsignarMenusRolRequest request) {
        if (request == null || request.getMenuIds() == null) {
            throw new BusinessException(
                    "VALIDATION_ERROR",
                    "El campo menuIds es obligatorio; envíe [] para limpiar las asignaciones del rol"
            );
        }
        validarRolExiste(rolId);

        List<UUID> menuIds = request.getMenuIds().stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();

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

        // REQ-SEG-114: misma invariante que SecurityUtils; el alias "ADMIN" no otorga privilegios.
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        if (isAdmin) {
            return menuService.buildArbol();
        }

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
        // REQ-SEG-009: keycloak_user_id es el "sub" del JWT; getName() es preferred_username.
        String keycloakUserId = authentication.getPrincipal() instanceof Jwt jwt
                ? jwt.getSubject()
                : null;
        if (keycloakUserId != null && !keycloakUserId.isBlank()) {
            usuarioJpaRepository.findByKeycloakUserId(keycloakUserId)
                    .ifPresent(usuario -> {
                        List<UsuarioRolEntity> userRoles = usuarioRolJpaRepository
                                .findActiveRolesByUsuarioId(usuario.getId());
                        userRoles.forEach(ur -> rolIds.add(ur.getRol().getId()));
                    });
        }

        String principalName = authentication.getName();
        if (principalName != null && !principalName.isBlank()) {
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
        Map<UUID, Menu> allMenusById = new HashMap<>();
        for (Menu m : allMenus) {
            if (m != null && m.getId() != null) {
                allMenusById.put(m.getId(), m);
            }
        }

        Set<UUID> assignedMenuIds = new HashSet<>();
        for (UUID menuId : menuIds) {
            Menu current = allMenusById.get(menuId);
            while (current != null) {
                if (current.isActivo()) {
                    assignedMenuIds.add(current.getId());
                }
                current = current.getMenuPadreId() != null
                        ? allMenusById.get(current.getMenuPadreId())
                        : null;
            }
        }

        // Asegurar que el menú de Inicio esté siempre accesible si existe en el sistema
        for (Menu m : allMenus) {
            if (m != null && m.getId() != null
                    && ("MOD_INICIO".equalsIgnoreCase(m.getCodigo()) || "MENU_INICIO".equalsIgnoreCase(m.getCodigo()))) {
                assignedMenuIds.add(m.getId());
            }
        }

        List<Menu> distinctMenus = assignedMenuIds.stream()
                .map(allMenusById::get)
                .filter(Objects::nonNull)
                .toList();

        return menuService.buildArbolFromMenus(distinctMenus);
    }

    private void validarRolExiste(UUID rolId) {
        if (rolRepository.findById(rolId).isEmpty()) {
            throw new ResourceNotFoundException("Rol", rolId);
        }
    }
}
