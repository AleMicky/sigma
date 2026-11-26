package com.endecorani.sigma_api.shared.util;

import com.endecorani.sigma_api.config.web.WebMvcDateTimeConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.SolicitudVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.SolicitudVehicularUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.ConductorService;
import com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller.ConductorController;
import org.junit.jupiter.api.Test;
import org.springframework.format.support.DefaultFormattingConversionService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class FlexibleLocalDateTimeTest {

    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @Test
    void parse_localDateTimeSinZona_debePreservarHoraExacta() {
        LocalDateTime parsed = FlexibleLocalDateTimeParser.parse("2026-11-26T10:00:00");
        assertEquals(LocalDateTime.of(2026, 11, 26, 10, 0, 0), parsed);
    }

    @Test
    void parse_isoUtcConSufijoZ_debeConvertirAAmericaLaPaz() {
        LocalDateTime parsed = FlexibleLocalDateTimeParser.parse("2026-11-26T14:00:00Z");
        assertEquals(LocalDateTime.of(2026, 11, 26, 10, 0, 0), parsed);
    }

    @Test
    void parse_isoConOffsetExplicito_debeConvertirAAmericaLaPaz() {
        LocalDateTime parsed = FlexibleLocalDateTimeParser.parse("2026-11-26T12:30:00-02:00");
        assertEquals(LocalDateTime.of(2026, 11, 26, 10, 30, 0), parsed);
    }

    @Test
    void parse_formatoInvalido_debeLanzarDateTimeParseException() {
        assertThrows(DateTimeParseException.class, () -> FlexibleLocalDateTimeParser.parse("fecha-invalida"));
    }

    @Test
    void solicitudVehicularRequest_debeDeserializarLocalDateTimeYUtcZSinError() {
        UUID tipoId = UUID.randomUUID();
        UUID solicitanteId = UUID.randomUUID();

        String jsonLocal = """
                {
                  "tipoSolicitudVehicularId": "%s",
                  "solicitanteId": "%s",
                  "motivo": "Inspección",
                  "destino": "Corani",
                  "fechaSalida": "2026-11-26T10:00:00",
                  "fechaRetornoEstimada": "2026-11-26T16:30:00",
                  "cantidadPasajeros": 2
                }
                """.formatted(tipoId, solicitanteId);

        String jsonUtc = """
                {
                  "tipoSolicitudVehicularId": "%s",
                  "solicitanteId": "%s",
                  "motivo": "Inspección",
                  "destino": "Corani",
                  "fechaSalida": "2026-11-26T14:00:00Z",
                  "fechaRetornoEstimada": "2026-11-26T20:30:00.000Z",
                  "cantidadPasajeros": 2
                }
                """.formatted(tipoId, solicitanteId);

        SolicitudVehicularRequest reqLocal = jsonMapper.readValue(jsonLocal, SolicitudVehicularRequest.class);
        SolicitudVehicularRequest reqUtc = jsonMapper.readValue(jsonUtc, SolicitudVehicularRequest.class);

        assertEquals(LocalDateTime.of(2026, 11, 26, 10, 0, 0), reqLocal.fechaSalida());
        assertEquals(LocalDateTime.of(2026, 11, 26, 16, 30, 0), reqLocal.fechaRetornoEstimada());
        assertEquals(LocalDateTime.of(2026, 11, 26, 10, 0, 0), reqUtc.fechaSalida());
        assertEquals(LocalDateTime.of(2026, 11, 26, 16, 30, 0), reqUtc.fechaRetornoEstimada());
    }

    @Test
    void solicitudVehicularUpdate_debeDeserializarUtcZAAmericaLaPaz() {
        String json = """
                {
                  "numero": "SV-2026-0001",
                  "tipoSolicitudVehicularId": "%s",
                  "solicitanteId": "%s",
                  "motivo": "Mantenimiento",
                  "destino": "Sacaba",
                  "fechaSalida": "2026-11-26T14:00:00Z",
                  "fechaRetornoEstimada": "2026-11-26T18:00:00-04:00",
                  "cantidadPasajeros": 1
                }
                """.formatted(UUID.randomUUID(), UUID.randomUUID());

        SolicitudVehicularUpdate update = jsonMapper.readValue(json, SolicitudVehicularUpdate.class);

        assertEquals(LocalDateTime.of(2026, 11, 26, 10, 0, 0), update.fechaSalida());
        assertEquals(LocalDateTime.of(2026, 11, 26, 18, 0, 0), update.fechaRetornoEstimada());
    }

    @Test
    void conductorControllerFindDisponibles_debeAceptarLocalDateTimeYUtcZConvertidoALaPaz() throws Exception {
        ConductorService conductorService = mock(ConductorService.class);
        when(conductorService.findDisponibles(any(), any())).thenReturn(List.of());

        DefaultFormattingConversionService conversionService = new DefaultFormattingConversionService();
        new WebMvcDateTimeConfig().addFormatters(conversionService);

        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new ConductorController(conductorService))
                .setConversionService(conversionService)
                .build();

        mockMvc.perform(get("/api/v1/conductores/disponibles")
                        .param("fechaSalida", "2026-11-26T14:00:00Z")
                        .param("fechaRetorno", "2026-11-26T18:00:00Z"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/conductores/disponibles")
                        .param("fechaSalida", "2026-11-26T10:00:00")
                        .param("fechaRetorno", "2026-11-26T14:00:00"))
                .andExpect(status().isOk());

        verify(conductorService, times(2)).findDisponibles(
                LocalDateTime.of(2026, 11, 26, 10, 0, 0),
                LocalDateTime.of(2026, 11, 26, 14, 0, 0)
        );
    }
}
