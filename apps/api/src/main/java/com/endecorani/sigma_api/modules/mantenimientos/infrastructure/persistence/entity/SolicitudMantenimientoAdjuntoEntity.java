package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        schema = "mantenimientos",
        name = "solicitud_mantenimiento_adjuntos",
        indexes = {
                @Index(
                        name = "idx_solicitud_adjunto_solicitud",
                        columnList = "solicitud_mantenimiento_id"
                )
        }
)
public class SolicitudMantenimientoAdjuntoEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "solicitud_mantenimiento_id",
            nullable = false
    )
    private SolicitudMantenimientoEntity solicitudMantenimiento;

    @Column(
            name = "nombre_archivo",
            nullable = false,
            length = 255
    )
    private String nombreArchivo;

    @Column(
            name = "tipo_contenido",
            nullable = false,
            length = 100
    )
    private String tipoContenido;

    @Column(
            name = "size",
            nullable = false
    )
    private Long size;

    @Column(
            name = "url",
            nullable = false,
            length = 1000
    )
    private String url;

    @Column(
            name = "descripcion",
            length = 500
    )
    private String descripcion;
}
