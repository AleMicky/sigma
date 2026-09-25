package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.seguridad.domain.model.TipoMenu;
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
                @Index(name = "idx_menus_activo", columnList = "activo"),
                @Index(name = "idx_menus_tipo", columnList = "tipo")
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

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "tipo", length = 30, nullable = false)
    private TipoMenu tipo = TipoMenu.ITEM;

    @Column(name = "icono", length = 100)
    private String icono;

    @Column(name = "ruta", length = 300)
    private String ruta;

    @Column(name = "badge", length = 50)
    private String badge;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Builder.Default
    @Column(name = "visible_en_menu", nullable = false)
    private boolean visibleEnMenu = true;

    @Builder.Default
    @Column(name = "orden", nullable = false)
    private Integer orden = 0;

    @Builder.Default
    @Column(name = "activo", nullable = false)
    private boolean activo = true;
}
