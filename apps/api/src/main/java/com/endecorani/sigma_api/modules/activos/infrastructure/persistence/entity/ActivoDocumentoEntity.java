package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
        schema = "activos",
        name = "activo_documento",
        indexes = {
                @Index(
                        name = "idx_activo_documento_activo",
                        columnList = "activo_id"
                ),
                @Index(
                        name = "idx_activo_documento_tipo",
                        columnList = "tipo_documento_id"
                ),
                @Index(
                        name = "idx_activo_documento_vencimiento",
                        columnList = "fecha_vencimiento"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivoDocumentoEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "activo_id",
            nullable = false
    )
    private ActivoEntity activo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "tipo_documento_id",
            nullable = false
    )
    private TiposDocumentoEntity tipoDocumento;

    @Column(
            name = "numero_documento",
            length = 100
    )
    private String numeroDocumento;

    @Column(
            name = "nombre",
            nullable = false,
            length = 150
    )
    private String nombre;

    @Column(
            name = "descripcion",
            length = 500
    )
    private String descripcion;

    @Column(name = "fecha_emision")
    private LocalDate fechaEmision;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Column(
            name = "nombre_archivo",
            nullable = false,
            length = 255
    )
    private String nombreArchivo;

    @Column(
            name = "ruta_archivo",
            nullable = false,
            length = 500
    )
    private String rutaArchivo;

    @Column(
            name = "mime_type",
            length = 100
    )
    private String mimeType;

    @Column(name = "size")
    private Long size;

}
