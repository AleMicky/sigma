package com.endecorani.sigma_api.modules.mantenimientos.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SolicitudMantenimientoAdjunto extends AuditableModel {

    private UUID id;
    private UUID solicitudMantenimientoId;
    private String nombreArchivo;
    private String url;
    private String tipoContenido;
    private Long size;
    private String descripcion;
}