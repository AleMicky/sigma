package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.seguridad.domain.model.TipoMenu;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "menus",
        schema = "seguridad",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_menus_codigo", columnNames = "codigo")
        },
        indexes = {
                @Index(name = "idx_menus_menu_padre_id", columnList = "menu_padre_id"),
                @Index(name = "idx_menus_activo_visible", columnList = "activo, visible_en_menu"),
                @Index(name = "idx_menus_padre_orden", columnList = "menu_padre_id, orden"),
                @Index(name = "idx_menus_tipo", columnList = "tipo")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString(exclude = {"menuPadre", "submenus"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class MenuEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "menu_padre_id",
            foreignKey = @ForeignKey(name = "fk_menus_menu_padre")
    )
    private MenuEntity menuPadre;

    @OneToMany(mappedBy = "menuPadre", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @OrderBy("orden ASC")
    @Builder.Default
    private List<MenuEntity> submenus = new ArrayList<>();

    @EqualsAndHashCode.Include
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

    @Column(name = "color", length = 50)
    private String color;

    @Column(name = "ruta", length = 300)
    private String ruta;

    @Column(name = "badge", length = 50)
    private String badge;

    @Column(name = "descripcion", length = 300)
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

    public boolean esRaiz() {
        return this.menuPadre == null;
    }

    public boolean esFolder() {
        return TipoMenu.MODULO.equals(this.tipo)
                || TipoMenu.AGRUPADOR.equals(this.tipo)
                || (this.ruta == null || this.ruta.isBlank());
    }

    public boolean esInterfaz() {
        return !esFolder();
    }
}

