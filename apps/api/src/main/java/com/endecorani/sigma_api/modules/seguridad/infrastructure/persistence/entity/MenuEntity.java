package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
        name = "menus",
        schema = "seguridad",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_menus_codigo", columnNames = "codigo")
        },
        indexes = {
                @Index(name = "idx_menus_menu_padre_id", columnList = "menu_padre_id"),
                @Index(name = "idx_menus_activo", columnList = "activo")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class MenuEntity extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "menu_padre_id",
            foreignKey = @ForeignKey(name = "fk_menus_menu_padre")
    )
    private MenuEntity menuPadre;

    @Column(name = "codigo", nullable = false, length = 100)
    private String codigo;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "icono", length = 100)
    private String icono;

    @Column(name = "ruta", length = 300)
    private String ruta;

    @Builder.Default
    @Column(name = "orden", nullable = false)
    private Integer orden = 0;

    @Builder.Default
    @Column(name = "activo", nullable = false)
    private boolean activo = true;
}
