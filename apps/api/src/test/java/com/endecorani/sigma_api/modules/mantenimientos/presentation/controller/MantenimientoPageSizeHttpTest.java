package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.modules.activos.application.dto.response.TipoActivoResponse;
import com.endecorani.sigma_api.modules.activos.application.service.TipoActivoService;
import com.endecorani.sigma_api.modules.activos.presentation.controller.TipoActivoController;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.SolicitudVehicularService;
import com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller.SolicitudVehicularController;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.ProgramacionMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.ProgramacionMantenimientoService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.presentation.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * REQ-MANT-030: mantenimientos rechaza size>500 con 400 INVALID_PAGE_SIZE, mientras
 * el resto de módulos conserva el clamp global (200 con 500 elementos por página).
 */
@ExtendWith(MockitoExtension.class)
class MantenimientoPageSizeHttpTest {

    @Mock
    private ProgramacionMantenimientoService programacionService;
    @Mock
    private SolicitudVehicularService solicitudVehicularService;
    @Mock
    private TipoActivoService tipoActivoService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(
                        new ProgramacionMantenimientoController(programacionService),
                        new SolicitudVehicularController(solicitudVehicularService),
                        new TipoActivoController(tipoActivoService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void programacionesConSize501_debeResponder400InvalidPageSize() throws Exception {
        mockMvc.perform(get("/api/v1/programaciones-mantenimiento").param("size", "501"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_PAGE_SIZE"));

        verifyNoInteractions(programacionService);
    }

    @Test
    void programacionesConSize500_debeResponder200() throws Exception {
        when(programacionService.findAll(any(), any(), any(), any(), any(PageRequestDto.class)))
                .thenReturn(new PageResponse<ProgramacionMantenimientoResponse>(
                        List.of(), 0, 500, 0, 0, true, true, true));

        mockMvc.perform(get("/api/v1/programaciones-mantenimiento").param("size", "500"))
                .andExpect(status().isOk());

        ArgumentCaptor<PageRequestDto> captor = ArgumentCaptor.forClass(PageRequestDto.class);
        verify(programacionService).findAll(any(), any(), any(), any(), captor.capture());
        assertEquals(500, captor.getValue().size());
    }

    @Test
    void solicitudesVehicularesConSize1000_debeResponder200ConClampGlobal() throws Exception {
        when(solicitudVehicularService.listar(
                        any(), any(), any(), any(), any(), any(), any(), any(PageRequestDto.class)))
                .thenReturn(new PageResponse<SolicitudVehicularResponse>(
                        List.of(), 0, 500, 0, 0, true, true, true));

        mockMvc.perform(get("/api/v1/solicitudes-vehiculares").param("size", "1000"))
                .andExpect(status().isOk());

        ArgumentCaptor<PageRequestDto> captor = ArgumentCaptor.forClass(PageRequestDto.class);
        verify(solicitudVehicularService).listar(
                any(), any(), any(), any(), any(), any(), any(), captor.capture());
        assertEquals(500, captor.getValue().size());
    }

    @Test
    void tiposActivoConSize1000_debeResponder200ConClampGlobal() throws Exception {
        when(tipoActivoService.findAll(any(PageRequestDto.class)))
                .thenReturn(new PageResponse<TipoActivoResponse>(
                        List.of(), 0, 500, 0, 0, true, true, true));

        mockMvc.perform(get("/api/v1/tipos-activo").param("size", "1000"))
                .andExpect(status().isOk());

        ArgumentCaptor<PageRequestDto> captor = ArgumentCaptor.forClass(PageRequestDto.class);
        verify(tipoActivoService).findAll(captor.capture());
        assertEquals(500, captor.getValue().size());
    }
}
