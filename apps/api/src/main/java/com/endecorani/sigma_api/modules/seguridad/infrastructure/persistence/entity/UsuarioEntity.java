package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
        name = "usuarios",
        schema = "seguridad",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_usuarios_keycloak_user_id",
                        columnNames = "keycloak_user_id"
                ),
                @UniqueConstraint(
                        name = "uk_usuarios_username",
                        columnNames = "username"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioEntity extends BaseEntity {

    @Column(
            name = "keycloak_user_id",
            nullable = false,
            length = 100
    )
    private String keycloakUserId;

    @Column(
            nullable = false,
            length = 100
    )
    private String username;

    @Column(length = 200)
    private String nombre;

    @Column(length = 200)
    private String email;

    @Builder.Default
    @Column(nullable = false)
    private boolean activo = true;
}