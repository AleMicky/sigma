package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        schema = "mantenimientos",
        name = "plan_mantenimiento_activos",
        indexes = {
                @Index(
                        name = "idx_plan_mantenimiento_activo_plan",
                        columnList = "plan_mantenimiento_id"
                ),
                @Index(
                        name = "idx_plan_mantenimiento_activo_activo",
                        columnList = "activo_id"
                ),
                @Index(
                        name = "idx_plan_mantenimiento_activo_responsable",
                        columnList = "responsable_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PlanMantenimientoActivoEntity extends BaseEntity {

    @Column(name = "plan_mantenimiento_id", nullable = false)
    private UUID planMantenimientoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "plan_mantenimiento_id",
            insertable = false,
            updatable = false
    )
    private PlanMantenimientoEntity planMantenimiento;

    @Column(name = "activo_id", nullable = false)
    private UUID activoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "activo_id",
            insertable = false,
            updatable = false
    )
    private ActivoEntity activo;

    @Column(name = "responsable_id")
    private UUID responsableId;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean estadoActivo = true;

    public Boolean isActivo() {
        return estadoActivo;
    }

    public void setActivo(Boolean activo) {
        this.estadoActivo = activo;
    }
}
