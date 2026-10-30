package com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(
        name = "incidentes_evidencias",
        schema = "incidentes",
        indexes = {
                @Index(name = "idx_incidente_evidencia_incidente", columnList = "incidente_activo_id")
        }
)
public class IncidenteEvidenciaEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "incidente_activo_id",
            nullable = false
    )
    private IncidenteActivoEntity incidenteActivo;

    @Column(
            name = "nombre_archivo",
            nullable = false,
            length = 255
    )
    private String nombreArchivo;

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
}
