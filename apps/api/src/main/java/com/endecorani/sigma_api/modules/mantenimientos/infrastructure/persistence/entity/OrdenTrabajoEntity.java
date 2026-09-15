package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(
        schema = "mantenimientos",
        name = "orden_trabajo",
        indexes = {
                @Index(
                        name = "idx_ot_solicitud",
                        columnList = "solicitud_mantenimiento_id"
                ),
                @Index(
                        name = "idx_ot_activo",
                        columnList = "activo_id"
                ),
                @Index(
                        name = "idx_ot_responsable",
                        columnList = "responsable_id"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_ot_numero",
                        columnNames = "numero"
                ),
                @UniqueConstraint(
                        name = "uk_ot_solicitud",
                        columnNames = "solicitud_mantenimiento_id"
                )
        }
)
public class OrdenTrabajoEntity extends BaseEntity {

    @Column(
            name = "numero",
            nullable = false,
            length = 30
    )
    private String numero;

    @Column(
            name = "solicitud_mantenimiento_id",
            nullable = false
    )
    private UUID solicitudMantenimientoId;

    @Column(
            name = "activo_id",
            nullable = false
    )
    private UUID activoId;

    @Column(
            name = "responsable_id",
            nullable = false
    )
    private UUID responsableId;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(
            name = "diagnostico",
            length = 2000
    )
    private String diagnostico;

    @Column(
            name = "trabajo_realizado",
            length = 4000
    )
    private String trabajoRealizado;

    @Column(
            name = "observacion",
            length = 2000
    )
    private String observacion;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "orden_trabajo_id")
    @Builder.Default
    private List<OrdenTrabajoActividadEntity> actividades = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "orden_trabajo_id")
    @Builder.Default
    private List<OrdenTrabajoAdjuntoEntity> adjuntos = new ArrayList<>();
}