package com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request;

/**
 * REQ-MANT-015: filtros opcionales del reporte de seguimiento preventivo.
 *
 * <p>Espejo de los selects de {@code ProgramacionSeguimientoReportView}: {@code TODOS} (o la
 * ausencia del parámetro) significa "sin filtro". La comparación es case-insensitive para
 * aceptar variaciones de mayúsculas del cliente sin romper el contrato.</p>
 */
public final class ReporteSeguimientoFiltros {

    public static final String INVALID_FILTER_VALUE_CODE = "INVALID_FILTER_VALUE";

    private static final String TODOS = "TODOS";

    public enum NivelAlertaReporte {
        CRITICO, PROXIMO, AL_DIA, INACTIVO
    }

    public enum TipoCriterioReporte {
        TIEMPO, KILOMETRAJE, HORAS_USO
    }

    private ReporteSeguimientoFiltros() {
    }

    /** @return {@code null} cuando no hay filtro; valor válido en caso contrario. */
    public static NivelAlertaReporte parsearAlerta(String valor) {
        if (esSinFiltro(valor)) {
            return null;
        }
        String normalizado = valor.trim().toUpperCase(java.util.Locale.ROOT);
        for (NivelAlertaReporte candidato : NivelAlertaReporte.values()) {
            if (candidato.name().equals(normalizado)) {
                return candidato;
            }
        }
        throw new IllegalArgumentException(INVALID_FILTER_VALUE_CODE);
    }

    /** @return {@code null} cuando no hay filtro; valor válido en caso contrario. */
    public static TipoCriterioReporte parsearCriterio(String valor) {
        if (esSinFiltro(valor)) {
            return null;
        }
        String normalizado = valor.trim().toUpperCase(java.util.Locale.ROOT);
        for (TipoCriterioReporte candidato : TipoCriterioReporte.values()) {
            if (candidato.name().equals(normalizado)) {
                return candidato;
            }
        }
        throw new IllegalArgumentException(INVALID_FILTER_VALUE_CODE);
    }

    private static boolean esSinFiltro(String valor) {
        return valor == null || valor.isBlank() || TODOS.equalsIgnoreCase(valor.trim());
    }
}
