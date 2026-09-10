package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        schema = "mantenimientos",
        name = "solicitudes_mantenimiento_trazabilidad",
        indexes = {
                @Index(
                        name = "idx_solicitud_trazabilidad_solicitud",
                        columnList = "solicitud_mantenimiento_id"
                ),
                @Index(
                        name = "idx_solicitud_trazabilidad_fecha",
                        columnList = "fecha"
                ),
                @Index(
                        name = "idx_solicitud_trazabilidad_empleado",
                        columnList = "empleado_id"
                )
        }
)
public class SolicitudMantenimientoTrazabilidadEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(
            name = "id",
            nullable = false,
            updatable = false
    )
    private UUID id;

    @Column(
            name = "solicitud_mantenimiento_id",
            nullable = false
    )
    private UUID solicitudMantenimientoId;

    @Column(
            name = "estado_anterior",
            length = 50
    )
    private String estadoAnterior;

    @Column(
            name = "estado_nuevo",
            nullable = false,
            length = 50
    )
    private String estadoNuevo;

    @Column(
            name = "comentario",
            length = 2000
    )
    private String comentario;

    @Column(
            name = "empleado_id",
            nullable = false
    )
    private UUID empleadoId;

    @Column(
            name = "fecha",
            nullable = false
    )
    private LocalDateTime fecha;
}