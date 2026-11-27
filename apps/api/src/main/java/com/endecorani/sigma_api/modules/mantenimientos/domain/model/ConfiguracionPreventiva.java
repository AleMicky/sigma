package com.endecorani.sigma_api.modules.mantenimientos.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ConfiguracionPreventiva extends AuditableModel {
    private UUID id;

    @Builder.Default
    private Integer diasAnticipacionAlerta = 15;

    @Builder.Default
    private BigDecimal kmAnticipacionAlerta = new BigDecimal("500.00");

    @Builder.Default
    private BigDecimal horasAnticipacionAlerta = new BigDecimal("50.00");

    @Builder.Default
    private Boolean evaluacionAutomaticaHabilitada = true;

    @Builder.Default
    private String cronEvaluacion = "0 0 6 * * *";
}
