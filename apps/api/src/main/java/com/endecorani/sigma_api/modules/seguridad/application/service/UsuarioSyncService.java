package com.endecorani.sigma_api.modules.seguridad.application.service;

import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.KeycloakUsuarioProvider;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioSyncService {

    private final KeycloakUsuarioProvider keycloakUsuarioProvider;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public int sincronizarTodos() {
        var usuariosKeycloak = keycloakUsuarioProvider.obtenerTodos();

        for (Usuario usuarioKeycloak : usuariosKeycloak) {
            var usuarioLocal = usuarioRepository
                    .findByKeycloakUserId(usuarioKeycloak.getKeycloakUserId());

            if (usuarioLocal.isPresent()) {
                Usuario usuario = usuarioLocal.get();
                usuario.actualizarDesdeKeycloak(
                        usuarioKeycloak.getUsername(),
                        usuarioKeycloak.getNombre(),
                        usuarioKeycloak.getEmail(),
                        usuarioKeycloak.isActivo()
                );
                usuarioRepository.save(usuario);
            } else {
                usuarioRepository.save(usuarioKeycloak);

            }

        }

        return usuariosKeycloak.size();

    }

}
