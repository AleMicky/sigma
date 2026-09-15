package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        schema = "mantenimientos",
        name = "solicitud_mantenimiento_adjuntos",
        indexes = {
                @Index(name = "idx_solicitud_adjunto_solicitud", columnList = "solicitud_mantenimiento_id")
        }
)
public class SolicitudMantenimientoAdjuntoEntity extends BaseEntity {

    @Column(name = "solicitud_mantenimiento_id", nullable = false)
    private UUID solicitudMantenimientoId;

    @Column(name = "nombre_archivo", nullable = false, length = 255)
    private String nombreArchivo;

    @Column(name = "url", nullable = false, length = 500)
    private String url;

    @Column(name = "tipo_contenido", length = 100)
    private String tipoContenido;

    @Column(name = "size")
    private Long size;

    @Column(name = "descripcion", length = 500)
    private String descripcion;
}