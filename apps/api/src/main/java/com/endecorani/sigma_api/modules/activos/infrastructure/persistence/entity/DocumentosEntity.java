package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(schema = "activos", name = "documentos")
public class DocumentosEntity extends BaseEntity {

    @Column(
            name = "activo_id",
            nullable = false
    )
    private UUID activoId;

    @Column(
            name = "tipo_documento_id",
            nullable = false
    )
    private UUID tipoDocumentoId;

    @Column(
            name = "nombre",
            nullable = false,
            length = 100
    )
    private String nombre;

    @Column(
            name = "descripcion",
            length = 255
    )
    private String descripcion;

    @Column(
            name = "nombre_original",
            length = 255
    )
    private String nombreOriginal;

    @Column(
            name = "nombre_archivo",
            length = 255
    )
    private String nombreArchivo;

    @Column(
            name = "ruta",
            length = 500
    )
    private String ruta;

    @Column(
            name = "extension",
            length = 20
    )
    private String extension;

    @Column(
            name = "mime_type",
            length = 100
    )
    private String mimeType;

    @Column(
            name = "tamano_bytes"
    )
    private Long tamanoBytes;

    @Column(
            name = "fecha_documento"
    )
    private LocalDate fechaDocumento;

    @Column(
            name = "fecha_vencimiento"
    )
    private LocalDate fechaVencimiento;
}