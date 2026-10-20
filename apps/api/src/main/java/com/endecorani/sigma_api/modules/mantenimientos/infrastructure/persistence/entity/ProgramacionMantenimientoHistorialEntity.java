package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        schema = "mantenimientos",
        name = "programacion_mantenimiento_historial",
        indexes = {
                @Index(
                        name = "idx_historial_prog_mantenimiento",
                        columnList = "programacion_mantenimiento_id"
                ),
                @Index(
                        name = "idx_historial_solicitud_mantenimiento",
                        columnList = "solicitud_mantenimiento_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ProgramacionMantenimientoHistorialEntity extends BaseEntity {

    @Column(name = "programacion_mantenimiento_id", nullable = false)
    private UUID programacionMantenimientoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programacion_mantenimiento_id", insertable = false, updatable = false)
    private ProgramacionMantenimientoEntity programacionMantenimiento;

    @Column(name = "solicitud_mantenimiento_id")
    private UUID solicitudMantenimientoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitud_mantenimiento_id", insertable = false, updatable = false)
    private SolicitudMantenimientoEntity solicitudMantenimiento;

    @Column(name = "solicitud_numero", length = 30)
    private String solicitudNumero;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_criterio_disparador", nullable = false, length = 30)
    private TipoCriterioMantenimiento tipoCriterioDisparador;

    @Column(name = "valor_disparador", nullable = false, length = 100)
    private String valorDisparador;

    @Column(name = "valor_limite", length = 100)
    private String valorLimite;

    @Column(name = "fecha_disparo", nullable = false)
    private LocalDateTime fechaDisparo;

    @Column(name = "snapshot_valores", columnDefinition = "TEXT")
    private String snapshotValores;

    @Column(name = "completado", nullable = false)
    @Builder.Default
    private Boolean completado = false;

    @Column(name = "fecha_servicio")
    private LocalDate fechaServicio;

    @Column(name = "valor_uso_servicio", precision = 15, scale = 2)
    private BigDecimal valorUsoServicio;

    @Column(name = "observacion", length = 500)
    private String observacion;
}
