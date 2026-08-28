package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoControlActivo;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
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
        schema = "mantenimientos",
        name = "control_activo",
        indexes = {
                @Index(
                        name = "idx_control_activo_solicitud",
                        columnList = "solicitud_mantenimiento_id"
                ),
                @Index(
                        name = "idx_control_activo_ot",
                        columnList = "orden_trabajo_id"
                ),
                @Index(
                        name = "idx_control_activo_activo",
                        columnList = "activo_id"
                )
        }
)
public class ControlActivoEntity extends BaseEntity {

    @Column(
            name = "solicitud_mantenimiento_id",
            nullable = false
    )
    private UUID solicitudMantenimientoId;

    @Column(
            name = "orden_trabajo_id"
    )
    private UUID ordenTrabajoId;

    @Column(
            name = "activo_id",
            nullable = false
    )
    private UUID activoId;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "tipo",
            nullable = false,
            length = 20
    )
    private TipoControlActivo tipo;

    @Column(
            name = "entregado_por_id"
    )
    private UUID entregadoPorId;

    @Column(
            name = "recibido_por_id"
    )
    private UUID recibidoPorId;

    @Column(
            name = "fecha",
            nullable = false
    )
    private LocalDateTime fecha;

    @Column(
            name = "conforme",
            nullable = false
    )
    private boolean conforme;

    @Column(
            name = "observacion",
            length = 500
    )
    private String observacion;
}