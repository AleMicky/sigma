package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        schema = "mantenimientos",
        name = "programacion_mantenimiento_criterios",
        indexes = {
                @Index(
                        name = "idx_criterios_prog_mantenimiento",
                        columnList = "programacion_mantenimiento_id"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_criterio_prog_tipo",
                        columnNames = {"programacion_mantenimiento_id", "tipo_criterio"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ProgramacionMantenimientoCriterioEntity extends BaseEntity {

    @Column(name = "programacion_mantenimiento_id", nullable = false)
    private UUID programacionMantenimientoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programacion_mantenimiento_id", insertable = false, updatable = false)
    private ProgramacionMantenimientoEntity programacionMantenimiento;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_criterio", nullable = false, length = 30)
    private TipoCriterioMantenimiento tipoCriterio;

    @Column(name = "intervalo_dias")
    private Integer intervaloDias;

    @Column(name = "intervalo_uso", precision = 15, scale = 2)
    private BigDecimal intervaloUso;

    @Column(name = "proxima_fecha")
    private LocalDate proximaFecha;

    @Column(name = "proximo_valor_uso", precision = 15, scale = 2)
    private BigDecimal proximoValorUso;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
