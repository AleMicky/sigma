package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;


@Entity
@Table(
        name = "permisos",
        schema = "seguridad",
        uniqueConstraints = {@UniqueConstraint(name = "uk_permisos_codigo", columnNames = "codigo")},
        indexes = {@Index(name = "idx_permisos_menu", columnList = "menu_id"), @Index(name = "idx_permisos_activo", columnList = "activo")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PermisoEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "menu_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_permisos_menu"
            )
    )
    private MenuEntity menu;

    @Column(
            name = "codigo",
            nullable = false,
            length = 200
    )
    private String codigo;

    @Column(
            name = "nombre",
            nullable = false,
            length = 200
    )
    private String nombre;

    @Column(
            name = "descripcion",
            length = 500
    )
    private String descripcion;

    @Column(
            name = "metodo_http",
            nullable = false,
            length = 10
    )
    private String metodoHttp;

    @Column(
            name = "ruta",
            nullable = false,
            length = 500
    )
    private String ruta;

    @Builder.Default
    @Column(
            name = "activo",
            nullable = false
    )
    private boolean activo = true;
}
