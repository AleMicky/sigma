package com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.fasterxml.jackson.annotation.JsonAlias;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProgramacionMantenimientoCriterioUpdate(
        TipoCriterioMantenimiento tipoCriterio,
        Integer intervaloDias,
        BigDecimal intervaloUso,
        LocalDate proximaFecha,
        BigDecimal proximoValorUso,
        @JsonAlias({"activo", "estadoActivo"})
        Boolean estadoActivo
) {
    public Boolean activo() {
        return estadoActivo;
    }
}
