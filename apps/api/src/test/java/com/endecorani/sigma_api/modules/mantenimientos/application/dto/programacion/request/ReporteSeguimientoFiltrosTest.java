package com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ReporteSeguimientoFiltros.NivelAlertaReporte;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ReporteSeguimientoFiltros.TipoCriterioReporte;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ReporteSeguimientoFiltrosTest {

    @Test
    void ausenciaTodosYCaseInsensitive_debenResolverse() {
        assertNull(ReporteSeguimientoFiltros.parsearAlerta(null));
        assertNull(ReporteSeguimientoFiltros.parsearAlerta("  "));
        assertNull(ReporteSeguimientoFiltros.parsearAlerta("todos"));
        assertNull(ReporteSeguimientoFiltros.parsearCriterio("TODOS"));

        assertEquals(NivelAlertaReporte.CRITICO, ReporteSeguimientoFiltros.parsearAlerta(" critico "));
        assertEquals(NivelAlertaReporte.AL_DIA, ReporteSeguimientoFiltros.parsearAlerta("al_dia"));
        assertEquals(TipoCriterioReporte.HORAS_USO, ReporteSeguimientoFiltros.parsearCriterio("horas_uso"));
    }

    @Test
    void valoresInvalidos_debenUsarElCodigoDelContrato() {
        IllegalArgumentException alerta = assertThrows(IllegalArgumentException.class,
                () -> ReporteSeguimientoFiltros.parsearAlerta("DESCONOCIDO"));
        IllegalArgumentException criterio = assertThrows(IllegalArgumentException.class,
                () -> ReporteSeguimientoFiltros.parsearCriterio("KM"));

        assertEquals("INVALID_FILTER_VALUE", alerta.getMessage());
        assertEquals("INVALID_FILTER_VALUE", criterio.getMessage());
    }
}
