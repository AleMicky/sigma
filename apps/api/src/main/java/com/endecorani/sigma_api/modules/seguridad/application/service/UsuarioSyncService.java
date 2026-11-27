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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioSyncService {

    private final KeycloakUsuarioProvider keycloakUsuarioProvider;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final RolJpaRepository rolJpaRepository;
    private final UsuarioRolJpaRepository usuarioRolJpaRepository;
    private final RolSyncService rolSyncService;
    private final SecurityUtils securityUtils;

    @Transactional
    public int sincronizarTodos() {
        // 1. Sincronizar catálogo de roles primero
        try {
            rolSyncService.sincronizarTodos();
        } catch (Exception e) {
            log.warn("No se pudo pre-sincronizar roles desde Keycloak: {}", e.getMessage());
        }

        // 2. Obtener usuarios desde Keycloak
        var usuariosKeycloak = keycloakUsuarioProvider.obtenerTodos();

        for (Usuario usuarioKeycloak : usuariosKeycloak) {
            var usuarioLocal = usuarioRepository
                    .findByKeycloakUserId(usuarioKeycloak.getKeycloakUserId());

            Usuario usuarioGuardado;
            if (usuarioLocal.isPresent()) {
                Usuario usuario = usuarioLocal.get();
                usuario.actualizarDesdeKeycloak(
                        usuarioKeycloak.getUsername(),
                        usuarioKeycloak.getNombre(),
                        usuarioKeycloak.getEmail(),
                        usuarioKeycloak.isActivo()
                );
                usuarioGuardado = usuarioRepository.save(usuario);
            } else {
                usuarioGuardado = usuarioRepository.save(usuarioKeycloak);
            }

            // 3. Sincronizar roles asignados al usuario en la tabla seguridad.usuarios_roles
            sincronizarRolesDeUsuario(usuarioGuardado);

            // 4. REQ-SEG-009: un usuario desactivado en Keycloak no debe seguir resolviéndose
            // desde la caché de auditoría con su estado anterior.
            if (!usuarioGuardado.isActivo()) {
                securityUtils.invalidateUser(
                        usuarioGuardado.getKeycloakUserId(), usuarioGuardado.getUsername());
            }
        }

        return usuariosKeycloak.size();
    }

    private void sincronizarRolesDeUsuario(Usuario usuario) {
        if (usuario.getId() == null || usuario.getKeycloakUserId() == null) {
            return;
        }

        UsuarioEntity usuarioEntity = usuarioJpaRepository.findById(usuario.getId()).orElse(null);
        if (usuarioEntity == null) {
            return;
        }

        // REQ-SEG-002: "sin roles" (lista vacía) es un sync legítimo; un fallo de la consulta
        // es un error 422 KEYCLOAK_SYNC_ERROR y no debe interpretarse como "sin roles".
        List<Rol> rolesKeycloak;
        try {
            rolesKeycloak = keycloakUsuarioProvider.obtenerRolesDeUsuario(usuario.getKeycloakUserId());
        } catch (BusinessException ex) {
            log.error("REQ-SEG-002: fallo al consultar roles en Keycloak para el usuario {}; " +
                    "no se desactivará ningún rol local", usuario.getKeycloakUserId(), ex);
            throw new BusinessException("KEYCLOAK_SYNC_ERROR", ex.getMessage());
        } catch (RuntimeException ex) {
            log.error("REQ-SEG-002: error inesperado al consultar roles en Keycloak para el usuario {}; " +
                    "no se desactivará ningún rol local", usuario.getKeycloakUserId(), ex);
            throw new BusinessException(
                    "KEYCLOAK_SYNC_ERROR",
                    "No se pudieron sincronizar los roles del usuario desde Keycloak: " + ex.getMessage()
            );
        }
        List<UsuarioRolEntity> rolesActuales = usuarioRolJpaRepository.findByUsuarioId(usuario.getId());

        Set<UUID> rolesKeycloakIds = new HashSet<>();

        for (Rol rolKc : rolesKeycloak) {
            Optional<RolEntity> rolEntityOpt = rolJpaRepository
                    .findByKeycloakRoleId(rolKc.getKeycloakRoleId())
                    .or(() -> rolJpaRepository.findByCodigoIgnoreCase(rolKc.getCodigo()));

            if (rolEntityOpt.isPresent()) {
                RolEntity rolEntity = rolEntityOpt.get();
                rolesKeycloakIds.add(rolEntity.getId());

                Optional<UsuarioRolEntity> usuarioRolOpt = rolesActuales.stream()
                        .filter(ur -> ur.getRol().getId().equals(rolEntity.getId()))
                        .findFirst();

                if (usuarioRolOpt.isPresent()) {
                    UsuarioRolEntity existing = usuarioRolOpt.get();
                    if (!existing.isActivo()) {
                        existing.setActivo(true);
                        usuarioRolJpaRepository.save(existing);
                    }
                } else {
                    UsuarioRolEntity nuevo = UsuarioRolEntity.builder()
                            .usuario(usuarioEntity)
                            .rol(rolEntity)
                            .activo(true)
                            .build();
                    usuarioRolJpaRepository.save(nuevo);
                }
            }
        }

        // Desactivar roles que ya no tenga asignados en Keycloak
        for (UsuarioRolEntity actual : rolesActuales) {
            if (!rolesKeycloakIds.contains(actual.getRol().getId()) && actual.isActivo()) {
                actual.setActivo(false);
                usuarioRolJpaRepository.save(actual);
            }
        }
    }
}
