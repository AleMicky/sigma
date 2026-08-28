package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
        name = "roles_menus",
        schema = "seguridad",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_roles_menus_rol_menu",
                        columnNames = {"rol_id", "menu_id"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_roles_menus_rol",
                        columnList = "rol_id"
                ),
                @Index(
                        name = "idx_roles_menus_menu",
                        columnList = "menu_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class RolMenuEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "rol_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_roles_menus_rol")
    )
    private RolEntity rol;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "menu_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_roles_menus_menu")
    )
    private MenuEntity menu;
}
