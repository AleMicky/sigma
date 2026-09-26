package com.endecorani.sigma_api.modules.gestionvehicular.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SolicitudVehicularAdjunto extends AuditableModel {
    private UUID id;
    private UUID solicitudVehicularId;
    private String nombreArchivo;
    private String nombreOriginal;
    private String url;
    private String mimeType;
    private Long size;
    private String descripcion;
}
