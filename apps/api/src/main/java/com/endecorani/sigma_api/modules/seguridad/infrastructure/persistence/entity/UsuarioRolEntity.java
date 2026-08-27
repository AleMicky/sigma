package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
        name = "usuarios_roles",
        schema = "seguridad",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_usuarios_roles_usuario_rol",
                        columnNames = {"usuario_id", "rol_id"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_usuarios_roles_usuario",
                        columnList = "usuario_id"
                ),
                @Index(
                        name = "idx_usuarios_roles_rol",
                        columnList = "rol_id"
                ),
                @Index(
                        name = "idx_usuarios_roles_activo",
                        columnList = "activo"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UsuarioRolEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "usuario_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_usuarios_roles_usuario")
    )
    private UsuarioEntity usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "rol_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_usuarios_roles_rol")
    )
    private RolEntity rol;

    @Builder.Default
    @Column(nullable = false)
    private boolean activo = true;
}
