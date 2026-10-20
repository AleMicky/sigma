package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        schema = "mantenimientos",
        name = "programaciones_mantenimiento",
        indexes = {
                @Index(
                        name = "idx_programaciones_mantenimiento_plan_activo",
                        columnList = "plan_mantenimiento_activo_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ProgramacionMantenimientoEntity extends BaseEntity {

    @Column(name = "plan_mantenimiento_activo_id", nullable = false)
    private UUID planMantenimientoActivoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_mantenimiento_activo_id", insertable = false, updatable = false)
    private PlanMantenimientoActivoEntity planMantenimientoActivo;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Builder.Default
    @OneToMany(
            mappedBy = "programacionMantenimiento",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ProgramacionMantenimientoCriterioEntity> criterios =
            new ArrayList<>();
}
