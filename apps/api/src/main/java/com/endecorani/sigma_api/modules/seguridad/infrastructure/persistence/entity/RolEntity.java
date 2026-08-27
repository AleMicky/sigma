package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
        name = "roles",
        schema = "seguridad",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_roles_codigo",
                        columnNames = "codigo"
                ),
                @UniqueConstraint(
                        name = "uk_roles_keycloak_role_id",
                        columnNames = "keycloak_role_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolEntity extends BaseEntity {

    @Column(
            name = "keycloak_role_id",
            length = 100
    )
    private String keycloakRoleId;

    @Column(
            nullable = false,
            length = 100
    )
    private String codigo;

    @Column(
            nullable = false,
            length = 150
    )
    private String nombre;

    @Column(length = 300)
    private String descripcion;

    @Builder.Default
    @Column(nullable = false)
    private boolean activo = true;
}