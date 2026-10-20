package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
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
        schema = "mantenimientos",
        name = "plan_mantenimiento_actividades",
        indexes = {
                @Index(
                        name = "idx_plan_actividad_plan",
                        columnList = "plan_mantenimiento_id"
                ),
                @Index(
                        name = "idx_plan_actividad_aplicacion",
                        columnList = "actividad_mantenimiento_aplicacion_id"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_plan_mantenimiento_actividad",
                        columnNames = {
                                "plan_mantenimiento_id",
                                "actividad_mantenimiento_aplicacion_id"
                        }
                )
        }
)
public class PlanMantenimientoActividadEntity extends BaseEntity {

    @Column(
            name = "plan_mantenimiento_id",
            nullable = false
    )
    private UUID planMantenimientoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "plan_mantenimiento_id",
            insertable = false,
            updatable = false
    )
    private PlanMantenimientoEntity planMantenimiento;

    @Column(
            name = "actividad_mantenimiento_aplicacion_id",
            nullable = false
    )
    private UUID actividadMantenimientoAplicacionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "actividad_mantenimiento_aplicacion_id",
            insertable = false,
            updatable = false
    )
    private ActividadMantenimientoAplicacionEntity actividadMantenimientoAplicacion;

    @Column(name = "orden", nullable = false)
    @Builder.Default
    private Integer orden = 0;

    @Column(name = "obligatorio", nullable = false)
    @Builder.Default
    private Boolean obligatorio = true;
}
