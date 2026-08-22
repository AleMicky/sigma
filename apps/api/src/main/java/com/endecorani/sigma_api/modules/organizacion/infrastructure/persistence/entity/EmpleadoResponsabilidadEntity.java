package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;


@Entity
@Table(schema = "organizacion",
        name = "empleados_responsabilidades",
        indexes = {
                @Index(
                        name = "idx_empleado_responsabilidad_empleado",
                        columnList = "empleado_id"
                ),
                @Index(
                        name = "idx_empleado_responsabilidad_responsabilidad",
                        columnList = "responsabilidad_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmpleadoResponsabilidadEntity extends BaseEntity {
    @Column(name = "empleado_id", nullable = false)
    private UUID empleadoId;

    @Column(name = "responsabilidad_id", nullable = false)
    private UUID responsabilidadId;

    @Column(name = "unidad_id")
    private UUID unidadId;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;
}
