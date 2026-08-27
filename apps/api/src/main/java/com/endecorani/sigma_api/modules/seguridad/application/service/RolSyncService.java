package com.endecorani.sigma_api.modules.seguridad.application.service;

import com.endecorani.sigma_api.modules.seguridad.domain.model.Rol;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.KeycloakRolProvider;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.RolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RolSyncService {

    private final KeycloakRolProvider keycloakRolProvider;
    private final RolRepository rolRepository;

    @Transactional
    public int sincronizarTodos() {
        var rolesKeycloak = keycloakRolProvider.obtenerTodos();

        for (Rol rolKeycloak : rolesKeycloak) {
            var rolLocal = rolRepository
                    .findByKeycloakRoleId(rolKeycloak.getKeycloakRoleId())
                    .or(() -> rolRepository.findByCodigo(rolKeycloak.getCodigo()));

            if (rolLocal.isPresent()) {
                Rol rol = rolLocal.get();
                rol.setKeycloakRoleId(rolKeycloak.getKeycloakRoleId());
                rol.actualizarDesdeKeycloak(
                        rolKeycloak.getCodigo(),
                        rolKeycloak.getNombre(),
                        rolKeycloak.getDescripcion(),
                        rolKeycloak.isActivo()
                );
                rolRepository.save(rol);
            } else {
                rolRepository.save(rolKeycloak);
            }
        }

        return rolesKeycloak.size();
    }
}
