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
public class Documentos extends AuditableModel {

    private UUID id;

    private UUID activoId;

    private UUID tipoDocumentoId;

    private String nombre;

    private String descripcion;

    private String nombreOriginal;

    private String nombreArchivo;

    private String ruta;

    private String extension;

    private String mimeType;

    private Long tamanoBytes;

    private LocalDate fechaDocumento;

    private LocalDate fechaVencimiento;
}
