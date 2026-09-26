package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(
        schema = "gestion_vehicular",
        name = "asignaciones_vehiculares",
        indexes = {
                @Index(
                        name = "idx_asignacion_vehicular_solicitud",
                        columnList = "solicitud_vehicular_id"
                ),
                @Index(
                        name = "idx_asignacion_vehicular_activo",
                        columnList = "activo_id"
                ),
                @Index(
                        name = "idx_asignacion_vehicular_conductor",
                        columnList = "conductor_id"
                )
        }
)
public class AsignacionVehicularEntity extends BaseEntity {
    @Column(
            name = "solicitud_vehicular_id",
            nullable = false
    )
    private UUID solicitudVehicularId;

    @Column(
            name = "activo_id",
            nullable = false
    )
    private UUID activoId;

    @Column(
            name = "conductor_id",
            nullable = false
    )
    private UUID conductorId;

    @Column(
            name = "asignado_por_id",
            nullable = false
    )
    private UUID asignadoPorId;

    @Column(
            name = "fecha_asignacion",
            nullable = false
    )
    private LocalDateTime fechaAsignacion;

    @Column(
            name = "observacion",
            length = 1000
    )
    private String observacion;
}
