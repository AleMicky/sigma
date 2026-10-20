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
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ProgramacionMantenimientoHistorial extends AuditableModel {
    private UUID id;
    private UUID programacionMantenimientoId;
    private UUID solicitudMantenimientoId;
    private String solicitudNumero;
    private TipoCriterioMantenimiento tipoCriterioDisparador;
    private String valorDisparador;
    private String valorLimite;
    private LocalDateTime fechaDisparo;
    private String snapshotValores;
    @Builder.Default
    private Boolean completado = false;
    private LocalDate fechaServicio;
    private BigDecimal valorUsoServicio;
    private String observacion;
}
