package com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ProgramacionMantenimientoCriterioRequest(
        UUID id,

        @NotNull(message = "El tipo de criterio es obligatorio (TIEMPO, KILOMETRAJE o HORAS_USO)")
        TipoCriterioMantenimiento tipoCriterio,

        Integer intervaloDias,

        BigDecimal intervaloUso,

        LocalDate proximaFecha,

        BigDecimal proximoValorUso,

        @JsonAlias({"activo", "estadoActivo"})
        Boolean estadoActivo
) {
    public Boolean activo() {
        return estadoActivo != null ? estadoActivo : true;
    }
}
