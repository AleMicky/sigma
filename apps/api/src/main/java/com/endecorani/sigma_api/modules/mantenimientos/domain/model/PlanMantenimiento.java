package com.endecorani.sigma_api.modules.mantenimientos.domain.model;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.EstadoPlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
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
public class PlanMantenimiento extends AuditableModel {
    private UUID id;

    private UUID tipoActivoId;

    private UUID tipoMantenimientoId;

    private String codigo;

    private String nombre;

    private String descripcion;

    @Builder.Default
    private EstadoPlanMantenimiento estado = EstadoPlanMantenimiento.ACTIVO;

    private TipoCriterioMantenimiento criterioDefaultTipo;

    private Integer criterioDefaultDias;

    private BigDecimal criterioDefaultUso;
}
