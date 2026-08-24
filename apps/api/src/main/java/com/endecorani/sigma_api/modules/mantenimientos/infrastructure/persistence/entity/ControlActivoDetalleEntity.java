package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

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
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        schema = "mantenimientos",
        name = "control_activo_detalle",
        indexes = {
                @Index(
                        name = "idx_control_activo_detalle_control",
                        columnList = "control_activo_id"
                ),
                @Index(
                        name = "idx_control_activo_detalle_accesorio",
                        columnList = "accesorio_id"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_control_activo_accesorio",
                        columnNames = {
                                "control_activo_id",
                                "accesorio_id"
                        }
                )
        }
)
@EntityListeners(AuditingEntityListener.class)
public class ControlActivoDetalleEntity {

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
            name = "control_activo_id",
            nullable = false
    )
    private UUID controlActivoId;

    @Column(
            name = "accesorio_id",
            nullable = false
    )
    private UUID accesorioId;

    @Column(
            name = "cantidad_esperada",
            nullable = false
    )
    private Integer cantidadEsperada;

    @Column(
            name = "cantidad_encontrada",
            nullable = false
    )
    private Integer cantidadEncontrada;

    @Column(
            name = "conforme",
            nullable = false
    )
    private boolean conforme;

    @Column(
            name = "observacion",
            length = 300
    )
    private String observacion;
}