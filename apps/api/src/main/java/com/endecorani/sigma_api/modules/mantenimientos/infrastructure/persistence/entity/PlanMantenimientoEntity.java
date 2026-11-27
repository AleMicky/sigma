package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.TipoActivoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.EstadoPlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(
        schema = "mantenimientos",
        name = "planes_mantenimiento",
        indexes = {
                @Index(
                        name = "idx_plan_mantenimiento_tipo_activo",
                        columnList = "tipo_activo_id"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_plan_mantenimiento_codigo",
                        columnNames = "codigo"
                )
        }
)
public class PlanMantenimientoEntity extends BaseEntity {

    @Column(
            name = "tipo_activo_id",
            nullable = false
    )
    private UUID tipoActivoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "tipo_activo_id",
            insertable = false,
            updatable = false
    )
    private TipoActivoEntity tipoActivo;

    @Column(
            name = "codigo",
            nullable = false,
            length = 30
    )
    private String codigo;

    @Column(
            name = "nombre",
            nullable = false,
            length = 200
    )
    private String nombre;

    @Column(
            name = "descripcion",
            columnDefinition = "TEXT"
    )
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private EstadoPlanMantenimiento estado = EstadoPlanMantenimiento.ACTIVO;

    @Column(name = "tipo_mantenimiento_id")
    private UUID tipoMantenimientoId;

    @Enumerated(EnumType.STRING)
    @Column(name = "criterio_default_tipo", length = 20)
    private TipoCriterioMantenimiento criterioDefaultTipo;

    @Column(name = "criterio_default_dias")
    private Integer criterioDefaultDias;

    @Column(name = "criterio_default_uso", precision = 15, scale = 2)
    private BigDecimal criterioDefaultUso;
}
