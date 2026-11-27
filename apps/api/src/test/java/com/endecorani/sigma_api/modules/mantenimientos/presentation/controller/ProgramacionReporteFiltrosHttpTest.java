package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.modules.mantenimientos.application.service.ProgramacionMantenimientoService;
import com.endecorani.sigma_api.shared.presentation.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** REQ-MANT-015: contrato HTTP del reporte Excel con los nuevos filtros opcionales. */
@ExtendWith(MockitoExtension.class)
class ProgramacionReporteFiltrosHttpTest {

    @Mock
    private ProgramacionMantenimientoService service;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ProgramacionMantenimientoController(service))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void reporteConFiltros_debePropagarLosSeisParametros() throws Exception {
        UUID planId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        when(service.generarReporteExcel(any(), any(), any(), any(), any(), any()))
                .thenReturn(new byte[]{1, 2, 3});

        mockMvc.perform(get("/api/v1/programaciones-mantenimiento/reporte-excel")
                        .param("planMantenimientoActivoId", planId.toString())
                        .param("activoId", activoId.toString())
                        .param("activo", "true")
                        .param("q", "ACT-01")
                        .param("filtroAlerta", "critico")
                        .param("filtroCriterio", "horas_uso"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        org.hamcrest.Matchers.startsWith("attachment; filename=\"seguimiento-mantenimiento-preventivo-")));

        ArgumentCaptor<String> alerta = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> criterio = ArgumentCaptor.forClass(String.class);
        verify(service).generarReporteExcel(
                org.mockito.ArgumentMatchers.eq(planId),
                org.mockito.ArgumentMatchers.eq(activoId),
                org.mockito.ArgumentMatchers.eq(true),
                org.mockito.ArgumentMatchers.eq("ACT-01"),
                alerta.capture(), criterio.capture());
        assertEquals("critico", alerta.getValue());
        assertEquals("horas_uso", criterio.getValue());
    }

    @Test
    void reporteConFiltroInvalido_debeResponder400InvalidFilterValue() throws Exception {
        when(service.generarReporteExcel(any(), any(), any(), any(), any(), any()))
                .thenThrow(new IllegalArgumentException("INVALID_FILTER_VALUE"));

        mockMvc.perform(get("/api/v1/programaciones-mantenimiento/reporte-excel")
                        .param("filtroAlerta", "DESCONOCIDO"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_FILTER_VALUE"));
    }
}
