package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoControlActivo;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
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
@EntityListeners(AuditingEntityListener.class)
public class ControlActivoEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(unique = true, nullable = false)
    private UUID id;

    @CreatedDate
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @CreatedBy
    @Column(
            name = "created_by",
            updatable = false,
            length = 100
    )
    private String createdBy;

    @LastModifiedBy
    @Column(
            name = "updated_by",
            length = 100
    )
    private String updatedBy;

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