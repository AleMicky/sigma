package com.endecorani.sigma_api.modules.activos.domain.model;


import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ActivoAtributo extends AuditableModel {

    private UUID id;

    private UUID tipoActivoId;

    private String codigo;

    private String etiqueta;

    private String descripcion;

    private UUID tipoDatoId;

    private Integer orden;

    private Boolean requerido;

    private Boolean visible;

    private Boolean editable;

    private String valorDefecto;

    private String opciones; // JSON, solo para SELECT/MULTISELECT

    private String urlImagen;

}
