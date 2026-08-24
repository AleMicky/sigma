package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        schema = "mantenimientos",
        name = "orden_trabajo_actividades",
        indexes = {
                @Index(
                        name = "idx_ot_actividad_orden",
                        columnList = "orden_trabajo_id"
                ),
                @Index(
                        name = "idx_ot_actividad_catalogo",
                        columnList = "actividad_mantenimiento_id"
                )
        }
)
public class OrdenTrabajoActividadEntity extends BaseEntity {

    @Column(
            name = "orden_trabajo_id",
            nullable = false
    )
    private UUID ordenTrabajoId;

    @Column(
            name = "actividad_mantenimiento_id"
    )
    private UUID actividadMantenimientoId;

    @Column(
            name = "descripcion",
            nullable = false,
            length = 1000
    )
    private String descripcion;

    @Column(
            name = "realizado",
            nullable = false
    )
    private boolean realizado;

    @Column(
            name = "observacion",
            length = 1500
    )
    private String observacion;

    @Column(name = "fecha_realizacion")
    private LocalDateTime fechaRealizacion;
}