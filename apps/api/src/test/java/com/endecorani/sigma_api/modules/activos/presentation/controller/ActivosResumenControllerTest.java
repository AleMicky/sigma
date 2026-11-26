package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoDocumentoResumenResponse;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResumenResponse;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoDocumentoService;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoService;
import com.endecorani.sigma_api.modules.activos.domain.enums.DocumentoEstadoFilter;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ActivosResumenControllerTest {

    @Mock private ActivoService activoService;
    @Mock private ActivoDocumentoService activoDocumentoService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(
                new ActivoController(activoService),
                new ActivoDocumentoController(activoDocumentoService)
        ).build();
    }

    @Test
    void getActivosResumen_exponeLosKpisBajoData() throws Exception {
        UUID tipoId = UUID.randomUUID();
        UUID ubicacionId = UUID.randomUUID();
        when(activoService.resumen("ACT-1", tipoId, ubicacionId, true))
                .thenReturn(new ActivoResumenResponse(20, 3, 4, 13));

        mockMvc.perform(get("/api/v1/activos/resumen")
                        .param("q", "ACT-1")
                        .param("tipoActivoId", tipoId.toString())
                        .param("ubicacionId", ubicacionId.toString())
                        .param("activo", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(20))
                .andExpect(jsonPath("$.data.deBaja").value(3))
                .andExpect(jsonPath("$.data.enMantenimiento").value(4))
                .andExpect(jsonPath("$.data.operativos").value(13));
    }

    @Test
    void getDocumentosResumen_exponeLosCincoConteosBajoData() throws Exception {
        UUID activoId = UUID.randomUUID();
        when(activoDocumentoService.resumen(eq(activoId), isNull(), eq("factura")))
                .thenReturn(new ActivoDocumentoResumenResponse(9, 2, 3, 1, 3));

        mockMvc.perform(get("/api/v1/activo-documentos/resumen")
                        .param("activoId", activoId.toString())
                        .param("query", "factura")
                        .param("estado", "POR_VENCER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(9))
                .andExpect(jsonPath("$.data.vigentes").value(2))
                .andExpect(jsonPath("$.data.porVencer").value(3))
                .andExpect(jsonPath("$.data.vencidos").value(1))
                .andExpect(jsonPath("$.data.permanentes").value(3));

        // El estado seleccionado filtra el listado, pero no debe reducir los KPIs.
        verify(activoDocumentoService).resumen(activoId, null, "factura");
    }

    @Test
    void getDocumentos_aplicaFiltrosDeServidorIncluyendoEstadoCaseInsensitive() throws Exception {
        UUID tipoDocumentoId = UUID.randomUUID();

        mockMvc.perform(get("/api/v1/activo-documentos")
                        .param("query", "factura")
                        .param("tipoDocumentoId", tipoDocumentoId.toString())
                        .param("estado", "por_vencer"))
                .andExpect(status().isOk());

        verify(activoDocumentoService).find(
                isNull(),
                eq(tipoDocumentoId),
                eq("factura"),
                eq(DocumentoEstadoFilter.POR_VENCER),
                any(PageRequestDto.class)
        );
    }
}
