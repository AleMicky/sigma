package com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.EstadoPlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record PlanPreventivoCompletoRequest(
        @NotNull(message = "El tipo de activo es obligatorio")
        UUID tipoActivoId,

        UUID tipoMantenimientoId,

        @NotBlank(message = "El código es obligatorio")
        @Size(max = 30, message = "El código no puede superar 30 caracteres")
        String codigo,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 200, message = "El nombre no puede superar 200 caracteres")
        String nombre,

        String descripcion,

        EstadoPlanMantenimiento estado,

        TipoCriterioMantenimiento criterioDefaultTipo,
        Integer criterioDefaultDias,
        BigDecimal criterioDefaultUso,

        @Valid
        List<ActividadItem> actividades,

        @Valid
        List<ActivoItem> activos
) {
    public record ActividadItem(
            @NotNull(message = "La actividad aplicable es obligatoria")
            UUID actividadMantenimientoAplicacionId,
            Integer orden,
            Boolean obligatorio
    ) {
    }

    public record CriterioItem(
            @NotNull(message = "El tipo de criterio es obligatorio")
            TipoCriterioMantenimiento tipoCriterio,
            Integer intervaloDias,
            BigDecimal intervaloUso,
            LocalDate proximaFecha,
            BigDecimal proximoValorUso,
            Boolean activo
    ) {
    }

    public record ActivoItem(
            @NotNull(message = "El activo es obligatorio")
            UUID activoId,
            UUID responsableId,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            Boolean activo,
            BigDecimal kilometrajeInicial,
            BigDecimal horasUsoInicial,
            @Valid
            List<CriterioItem> criterios
    ) {
    }
}
