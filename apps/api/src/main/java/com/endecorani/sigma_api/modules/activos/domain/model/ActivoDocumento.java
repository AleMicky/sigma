package com.endecorani.sigma_api.modules.activos.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ActivoDocumento extends AuditableModel {

    private UUID id;

    private UUID activoId;

    private UUID tipoDocumentoId;

    private String numeroDocumento;

    private String nombre;

    private String descripcion;

    private LocalDate fechaEmision;

    private LocalDate fechaVencimiento;

    private String nombreArchivo;

    private String rutaArchivo;

    private String mimeType;

    private Long size;

}
