package com.endecorani.sigma_api.modules.seguridad.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(of = "id", callSuper = false)
public class Menu extends AuditableModel {
    private UUID id;
    private UUID menuPadreId;
    private String codigo;
    private String nombre;
    private TipoMenu tipo;
    private String icono;
    private String color;
    private String ruta;
    private String badge;
    private String descripcion;
    private boolean visibleEnMenu;
    private Integer orden;
    private boolean activo;

    public boolean esRaiz() {
        return this.menuPadreId == null;
    }

    public boolean esFolder() {
        return TipoMenu.MODULO.equals(this.tipo)
                || TipoMenu.AGRUPADOR.equals(this.tipo)
                || (this.ruta == null || this.ruta.isBlank());
    }

    public boolean esInterfaz() {
        return !esFolder();
    }

    public boolean esContenedor() {
        return esFolder();
    }

    public void activar() {
        this.activo = true;
    }

    public void desactivar() {
        this.activo = false;
    }
}