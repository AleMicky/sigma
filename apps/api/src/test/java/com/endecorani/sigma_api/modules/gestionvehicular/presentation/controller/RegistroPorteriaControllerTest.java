package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.modules.gestionvehicular.application.service.RegistroPorteriaService;
import com.endecorani.sigma_api.shared.presentation.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.json.JsonMapper;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RegistroPorteriaControllerTest {

    private static final ZoneId ZONA = ZoneId.of("America/La_Paz");

    private final JsonMapper jsonMapper = JsonMapper.builder().build();
    private RegistroPorteriaService service;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        service = mock(RegistroPorteriaService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new RegistroPorteriaController(service))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void anular_motivoExcedeLongitud_debeRetornar400SinInvocarServicio() throws Exception {
        String body = jsonMapper.writeValueAsString(Map.of("motivo", "x".repeat(1001)));

        mockMvc.perform(post("/api/v1/porteria/{id}/anular", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(service);
    }

    @Test
    void anular_motivoValido_debeRetornar200YLlamarAlServicio() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(post("/api/v1/porteria/{id}/anular", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"motivo\":\"Duplicado\"}"))
                .andExpect(status().isOk());

        verify(service).anular(eq(id), argThat(request -> "Duplicado".equals(request.motivo())));
    }

    @Test
    void reporteBitacora_fechaInvalida_debeRetornar400EnVezDeIgnorarElFiltro() throws Exception {
        mockMvc.perform(get("/api/v1/porteria/reporte")
                        .param("fechaDesde", "fecha-invalida"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(service);
    }

    @Test
    void listar_fechasLocales_debeConvertirlasDesdeAmericaLaPaz() throws Exception {
        ArgumentCaptor<Instant> desde = ArgumentCaptor.forClass(Instant.class);
        ArgumentCaptor<Instant> hasta = ArgumentCaptor.forClass(Instant.class);

        mockMvc.perform(get("/api/v1/porteria")
                        .param("fechaDesde", "2026-11-26T00:00:00")
                        .param("fechaHasta", "2026-11-26"))
                .andExpect(status().isOk());

        verify(service).listar(
                isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), isNull(),
                desde.capture(), hasta.capture(), any());
        assertEquals(Instant.parse("2026-11-26T04:00:00Z"), desde.getValue());
        assertEquals(
                LocalDate.of(2026, 11, 27).atStartOfDay(ZONA).toInstant().minusNanos(1),
                hasta.getValue());
    }
}
