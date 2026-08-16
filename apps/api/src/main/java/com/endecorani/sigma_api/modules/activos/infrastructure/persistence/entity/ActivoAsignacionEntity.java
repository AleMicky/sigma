package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        schema = "activos",
        name = "activo_asignaciones",
        indexes = {
                @Index(
                        name = "idx_activo_asignacion_activo",
                        columnList = "activo_id"
                ),
                @Index(
                        name = "idx_activo_asignacion_empleado",
                        columnList = "empleado_id"
                ),
                @Index(
                        name = "idx_activo_asignacion_area",
                        columnList = "area_id"
                ),
                @Index(
                        name = "idx_activo_asignacion_fecha",
                        columnList = "fecha_asignacion"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivoAsignacionEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "activo_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_activo_asignacion_activo"
            )
    )
    private ActivoEntity activo;

    @Column(name = "empleado_id")
    private UUID empleadoId;

    @Column(name = "area_id")
    private UUID areaId;

    @Column(
            name = "fecha_asignacion",
            nullable = false
    )
    private LocalDateTime fechaAsignacion;

    @Column(name = "fecha_devolucion")
    private LocalDateTime fechaDevolucion;

    @Column(
            name = "observacion_asignacion",
            length = 500
    )
    private String observacionAsignacion;

    @Column(
            name = "observacion_devolucion",
            length = 500
    )
    private String observacionDevolucion;
}