package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;


@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        schema = "mantenimientos",
        name = "actividad_mantenimiento_aplicaciones",
        indexes = {
                @Index(
                        name = "idx_actividad_aplicacion_actividad",
                        columnList = "actividad_mantenimiento_id"
                ),
                @Index(
                        name = "idx_actividad_aplicacion_tipo_activo",
                        columnList = "tipo_activo_id"
                ),
                @Index(
                        name = "idx_actividad_aplicacion_componente",
                        columnList = "componente_id"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_actividad_aplicacion",
                        columnNames = {
                                "actividad_mantenimiento_id",
                                "tipo_activo_id",
                                "componente_id"
                        }
                )
        }
)
public class ActividadMantenimientoAplicacionEntity extends BaseEntity {
    @Column(
            name = "actividad_mantenimiento_id",
            nullable = false
    )
    private UUID actividadMantenimientoId;

    @Column(
            name = "tipo_activo_id",
            nullable = false
    )
    private UUID tipoActivoId;

    @Column(
            name = "componente_id"
    )
    private UUID componenteId;
}
