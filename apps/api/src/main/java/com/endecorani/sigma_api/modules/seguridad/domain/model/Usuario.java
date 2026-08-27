package com.endecorani.sigma_api.modules.seguridad.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Usuario extends AuditableModel {
    private UUID id;
    private String keycloakUserId;
    private String username;
    private String nombre;
    private String email;
    private boolean activo;

    public void actualizarDesdeKeycloak(
            String username,
            String nombre,
            String email,
            boolean activo
    ) {
        this.username = username;
        this.nombre = nombre;
        this.email = email;
        this.activo = activo;
    }
}
