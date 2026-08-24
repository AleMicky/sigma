package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        schema = "mantenimientos",
        name = "orden_trabajo_adjuntos",
        indexes = {
                @Index(
                        name = "idx_ot_adjunto_orden",
                        columnList = "orden_trabajo_id"
                )
        }
)
public class OrdenTrabajoAdjuntoEntity extends BaseEntity {

    @Column(
            name = "orden_trabajo_id",
            nullable = false
    )
    private UUID ordenTrabajoId;

    @Column(
            name = "nombre_archivo",
            nullable = false,
            length = 255
    )
    private String nombreArchivo;

    @Column(
            name = "tipo_mime",
            nullable = false,
            length = 100
    )
    private String tipoMime;

    @Column(name = "tamanio")
    private Long tamanio;

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