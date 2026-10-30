package com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
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
@Entity
@Table(
        name = "incidentes_involucrados",
        schema = "incidentes",
        indexes = {
                @Index(name = "idx_incidente_involucrado_incidente", columnList = "incidente_activo_id"),
                @Index(name = "idx_incidente_involucrado_empleado", columnList = "empleado_id")
        }
)
public class IncidenteInvolucradoEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "incidente_activo_id", nullable = false)
    private IncidenteActivoEntity incidenteActivo;

    @Column(name = "tipo_involucrado", nullable = false, length = 100)
    private String tipoInvolucrado;

    @Column(name = "empleado_id")
    private UUID empleadoId;

    @Column(name = "nombre", length = 255)
    private String nombre;

    @Column(name = "documento_identidad", length = 100)
    private String documentoIdentidad;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;
}
