package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(schema = "mantenimientos", name = "configuracion_preventiva")
public class ConfiguracionPreventivaEntity extends BaseEntity {

    @Column(name = "dias_anticipacion_alerta", nullable = false)
    @Builder.Default
    private Integer diasAnticipacionAlerta = 15;

    @Column(name = "km_anticipacion_alerta", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal kmAnticipacionAlerta = new BigDecimal("500.00");

    @Column(name = "horas_anticipacion_alerta", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal horasAnticipacionAlerta = new BigDecimal("50.00");

    @Column(name = "evaluacion_automatica_habilitada", nullable = false)
    @Builder.Default
    private Boolean evaluacionAutomaticaHabilitada = true;

    @Column(name = "cron_evaluacion", nullable = false, length = 100)
    @Builder.Default
    private String cronEvaluacion = "0 0 6 * * *";
}
