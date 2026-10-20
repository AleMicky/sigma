package com.endecorani.sigma_api.modules.mantenimientos.domain.model;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ProgramacionMantenimientoCriterio extends AuditableModel {
    private UUID id;

    private UUID programacionMantenimientoId;

    private TipoCriterioMantenimiento tipoCriterio;

    private Integer intervaloDias;

    private BigDecimal intervaloUso;

    private LocalDate proximaFecha;

    private BigDecimal proximoValorUso;

    @Builder.Default
    private Boolean activo = true;
}
