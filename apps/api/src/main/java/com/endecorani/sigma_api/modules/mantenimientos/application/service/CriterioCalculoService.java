package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.EstadoAlertaPreventiva;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ConfiguracionPreventiva;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoCriterio;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Servicio puro para cálculo de próximos vencimientos y evaluación de alertas
 * preventivas por fecha, kilometraje u horas de uso (regla OR: el primero que venza).
 */
@Service
public class CriterioCalculoService {

    public static final ZoneId ZONA_BOLIVIA = ZoneId.of("America/La_Paz");

    public LocalDate calcularProximaFecha(LocalDate fechaBase, Integer intervaloDias) {
        if (intervaloDias == null || intervaloDias <= 0) {
            return null;
        }
        LocalDate base = fechaBase != null ? fechaBase : LocalDate.now(ZONA_BOLIVIA);
        return base.plusDays(intervaloDias);
    }

    public BigDecimal calcularProximoValorUso(BigDecimal valorBase, BigDecimal intervaloUso) {
        if (intervaloUso == null || intervaloUso.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        BigDecimal base = valorBase != null ? valorBase : BigDecimal.ZERO;
        return base.add(intervaloUso);
    }

    public EstadoAlertaPreventiva evaluarCriterio(
            ProgramacionMantenimientoCriterio criterio,
            LocalDate hoy,
            BigDecimal kmActual,
            BigDecimal horasActual,
            ConfiguracionPreventiva config
    ) {
        if (criterio == null || !Boolean.TRUE.equals(criterio.getActivo())) {
            return EstadoAlertaPreventiva.INACTIVO;
        }
        LocalDate fechaRef = hoy != null ? hoy : LocalDate.now(ZONA_BOLIVIA);
        ConfiguracionPreventiva cfg = config != null ? config : ConfiguracionPreventiva.builder().build();

        if (criterio.getTipoCriterio() == TipoCriterioMantenimiento.TIEMPO) {
            if (criterio.getProximaFecha() == null) {
                return EstadoAlertaPreventiva.AL_DIA;
            }
            long diasRestantes = ChronoUnit.DAYS.between(fechaRef, criterio.getProximaFecha());
            if (diasRestantes <= 0) {
                return EstadoAlertaPreventiva.CRITICO;
            }
            int umbralDias = cfg.getDiasAnticipacionAlerta() != null ? cfg.getDiasAnticipacionAlerta() : 15;
            return diasRestantes <= umbralDias ? EstadoAlertaPreventiva.PROXIMO : EstadoAlertaPreventiva.AL_DIA;
        }

        BigDecimal actual = criterio.getTipoCriterio() == TipoCriterioMantenimiento.KILOMETRAJE
                ? kmActual
                : horasActual;
        if (criterio.getProximoValorUso() == null || actual == null) {
            return EstadoAlertaPreventiva.AL_DIA;
        }

        BigDecimal restante = criterio.getProximoValorUso().subtract(actual);
        if (restante.compareTo(BigDecimal.ZERO) <= 0) {
            return EstadoAlertaPreventiva.CRITICO;
        }

        BigDecimal umbralUso = criterio.getTipoCriterio() == TipoCriterioMantenimiento.KILOMETRAJE
                ? cfg.getKmAnticipacionAlerta()
                : cfg.getHorasAnticipacionAlerta();

        if (umbralUso != null && restante.compareTo(umbralUso) <= 0) {
            return EstadoAlertaPreventiva.PROXIMO;
        }

        if (criterio.getIntervaloUso() != null && criterio.getIntervaloUso().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal inicio = criterio.getProximoValorUso().subtract(criterio.getIntervaloUso());
            BigDecimal avance = actual.subtract(inicio);
            int pct = avance.multiply(BigDecimal.valueOf(100))
                    .divide(criterio.getIntervaloUso(), 0, RoundingMode.HALF_UP)
                    .intValue();
            if (pct >= 85) {
                return EstadoAlertaPreventiva.PROXIMO;
            }
        }
        return EstadoAlertaPreventiva.AL_DIA;
    }

    /**
     * Regla OR para criterios combinados: el estado global de la programación es
     * el más severo entre sus criterios activos (CRITICO > PROXIMO > AL_DIA > INACTIVO).
     */
    public EstadoAlertaPreventiva evaluarProgramacion(
            boolean programacionActiva,
            List<ProgramacionMantenimientoCriterio> criterios,
            LocalDate hoy,
            BigDecimal kmActual,
            BigDecimal horasActual,
            ConfiguracionPreventiva config
    ) {
        if (!programacionActiva || criterios == null || criterios.isEmpty()) {
            return programacionActiva ? EstadoAlertaPreventiva.AL_DIA : EstadoAlertaPreventiva.INACTIVO;
        }
        EstadoAlertaPreventiva peor = EstadoAlertaPreventiva.INACTIVO;
        for (ProgramacionMantenimientoCriterio criterio : criterios) {
            EstadoAlertaPreventiva estado = evaluarCriterio(criterio, hoy, kmActual, horasActual, config);
            if (severidad(estado) > severidad(peor)) {
                peor = estado;
            }
        }
        return peor;
    }

    private int severidad(EstadoAlertaPreventiva estado) {
        return switch (estado) {
            case INACTIVO -> 0;
            case AL_DIA -> 1;
            case PROXIMO -> 2;
            case CRITICO -> 3;
        };
    }
}
