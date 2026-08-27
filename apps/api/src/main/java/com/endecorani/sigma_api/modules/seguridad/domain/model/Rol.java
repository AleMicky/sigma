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
public class Rol extends AuditableModel {
    private UUID id;
    private String keycloakRoleId;
    private String codigo;
    private String nombre;
    private String descripcion;
    private boolean activo;

    public void actualizarDesdeKeycloak(
            String codigo,
            String nombre,
            String descripcion,
            boolean activo
    ) {

        this.codigo = codigo;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.activo = activo;
    }
}
