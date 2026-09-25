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
public class Menu extends AuditableModel {
    private UUID id;
    private UUID menuPadreId;
    private String codigo;
    private String nombre;
    private TipoMenu tipo;
    private String icono;
    private String ruta;
    private String badge;
    private String descripcion;
    private boolean visibleEnMenu;
    private Integer orden;
    private boolean activo;
}