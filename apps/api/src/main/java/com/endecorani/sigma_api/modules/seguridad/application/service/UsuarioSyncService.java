package com.endecorani.sigma_api.modules.seguridad.application.service;

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

        List<Rol> rolesKeycloak = keycloakUsuarioProvider.obtenerRolesDeUsuario(usuario.getKeycloakUserId());
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
