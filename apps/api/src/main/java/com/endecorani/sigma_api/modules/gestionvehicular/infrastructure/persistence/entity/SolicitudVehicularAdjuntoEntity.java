package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(
        schema = "gestion_vehicular",
        name = "solicitud_vehicular_adjuntos",
        indexes = {
                @Index(
                        name = "idx_solicitud_vehicular_adjunto_solicitud",
                        columnList = "solicitud_vehicular_id"
                )
        }
)
public class SolicitudVehicularAdjuntoEntity extends BaseEntity {
    @Column(
            name = "solicitud_vehicular_id",
            nullable = false
    )
    private UUID solicitudVehicularId;

    @Column(
            name = "nombre_archivo",
            nullable = false,
            length = 255
    )
    private String nombreArchivo;

    @Column(
            name = "nombre_original",
            nullable = false,
            length = 255
    )
    private String nombreOriginal;

    @Column(
            name = "url",
            nullable = false,
            length = 1000
    )
    private String url;

    @Column(
            name = "mime_type",
            nullable = false,
            length = 100
    )
    private String mimeType;

    @Column(
            name = "size",
            nullable = false
    )
    private Long size;

    @Column(
            name = "descripcion",
            length = 500
    )
    private String descripcion;
}
