package com.endecorani.sigma_api.modules.cuestionarios.presentation.controller;

import com.endecorani.sigma_api.config.security.KeycloakJwtAuthenticationConverter;
import com.endecorani.sigma_api.config.security.RestAccessDeniedHandler;
import com.endecorani.sigma_api.config.security.RestAuthenticationEntryPoint;
import com.endecorani.sigma_api.config.security.SecurityConfig;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.AsignacionDetalleResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.CuestionarioDetalleResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.CuestionarioReporteResumenResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.service.CuestionarioAsignacionService;
import com.endecorani.sigma_api.modules.cuestionarios.application.service.CuestionarioReporteService;
import com.endecorani.sigma_api.modules.cuestionarios.application.service.CuestionarioService;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoCuestionario;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.presentation.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import tools.jackson.databind.json.JsonMapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebAppConfiguration
@SpringJUnitConfig(classes = CuestionarioControllersSecurityTest.TestConfig.class)
class CuestionarioControllersSecurityTest {

    private static final String BASE = "/api/v1/cuestionarios";
    private static final String ASIGNACIONES = BASE + "/asignaciones";
    private static final String REPORTES = BASE + "/reportes";
    private static final UUID SAMPLE_ID = UUID.fromString("c1000000-0000-4000-a000-000000000001");

    private static final String VALID_CUESTIONARIO_JSON = """
            {
              "codigo": "EVAL_TEST",
              "nombre": "Cuestionario Test",
              "moduloOrigen": "GESTION_VEHICULAR",
              "entidadTipo": "SOLICITUD_VEHICULAR",
              "eventoDisparador": "AL_FINALIZAR"
            }
            """;

    private static final String VALID_PREGUNTAS_JSON = """
            {
              "preguntas": []
            }
            """;

    private static final String VALID_LOTE_JSON = """
            {
              "entidadTipo": "SOLICITUD_VEHICULAR",
              "entidadIds": ["c1000000-0000-4000-a000-000000000001"]
            }
            """;

    private static final String VALID_RESPONDER_JSON = """
            {
              "comentarioGeneral": "Todo bien",
              "respuestas": []
            }
            """;

    @Autowired private WebApplicationContext context;
    @Autowired private CuestionarioService cuestionarioService;
    @Autowired private CuestionarioAsignacionService asignacionService;
    @Autowired private CuestionarioReporteService reporteService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        CuestionarioDetalleResponse detalle = new CuestionarioDetalleResponse(
                SAMPLE_ID, "EVAL_TEST", "Cuestionario Test", null,
                "GESTION_VEHICULAR", "SOLICITUD_VEHICULAR", "AL_FINALIZAR",
                1, EstadoCuestionario.BORRADOR, false, false, true, 0L,
                List.of(), Instant.now(), null
        );
        when(cuestionarioService.listar(any(), any(), any(), any(), any()))
                .thenReturn(new PageResponse<>(List.of(), 0, 20, 0, 0, true, true, true));
        when(cuestionarioService.disparadores()).thenReturn(List.of());
        when(cuestionarioService.obtenerDetalle(any())).thenReturn(detalle);
        when(cuestionarioService.crear(any())).thenReturn(detalle);
        when(cuestionarioService.actualizar(any(), any())).thenReturn(detalle);
        when(cuestionarioService.reemplazarPreguntas(any(), any())).thenReturn(detalle);
        when(cuestionarioService.publicar(any(), anyBoolean())).thenReturn(detalle);
        when(cuestionarioService.inactivar(any())).thenReturn(detalle);
        when(cuestionarioService.crearNuevaVersion(any())).thenReturn(detalle);

        when(asignacionService.listarMisPendientes(any(), any(), any()))
                .thenReturn(new PageResponse<>(List.of(), 0, 20, 0, 0, true, true, true));
        when(asignacionService.listarPorEntidad(any(), any())).thenReturn(List.of());
        when(asignacionService.listarMisAsignacionesEnLote(any(), any())).thenReturn(List.of());
        when(asignacionService.obtenerDetalle(any())).thenReturn(new AsignacionDetalleResponse(null, detalle, List.of()));
        when(asignacionService.responder(any(), any())).thenReturn(new AsignacionDetalleResponse(null, detalle, List.of()));

        when(reporteService.obtenerResumen(any(), any(), any(), any()))
                .thenReturn(new CuestionarioReporteResumenResponse(
                        SAMPLE_ID, "Test", false, 0, 0, 0, BigDecimal.ZERO, null, null, List.of(), List.of()
                ));
        when(reporteService.listarRespuestas(any(), any(), any(), any(), any()))
                .thenReturn(new PageResponse<>(List.of(), 0, 20, 0, 0, true, true, true));

        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @Configuration
    @EnableWebMvc
    @EnableWebSecurity
    @Import({SecurityConfig.class, GlobalExceptionHandler.class})
    static class TestConfig {

        @Bean JsonMapper jsonMapper() { return JsonMapper.builder().build(); }
        @Bean RestAuthenticationEntryPoint restAuthenticationEntryPoint(JsonMapper m) { return new RestAuthenticationEntryPoint(m); }
        @Bean RestAccessDeniedHandler restAccessDeniedHandler(JsonMapper m) { return new RestAccessDeniedHandler(m); }
        @Bean KeycloakJwtAuthenticationConverter keycloakJwtAuthenticationConverter() { return new KeycloakJwtAuthenticationConverter(); }
        @Bean JwtDecoder jwtDecoder() { return mock(JwtDecoder.class); }

        @Bean CuestionarioService cuestionarioService() { return mock(CuestionarioService.class); }
        @Bean CuestionarioAsignacionService asignacionService() { return mock(CuestionarioAsignacionService.class); }
        @Bean CuestionarioReporteService reporteService() { return mock(CuestionarioReporteService.class); }

        @Bean CuestionarioController cuestionarioController(CuestionarioService s) { return new CuestionarioController(s); }
        @Bean CuestionarioAsignacionController asignacionController(CuestionarioAsignacionService s) { return new CuestionarioAsignacionController(s); }
        @Bean CuestionarioReporteController reporteController(CuestionarioReporteService s) { return new CuestionarioReporteController(s); }
    }

    @Test
    void sinAutenticacion_devuelve401EnTodosLosEndpoints() throws Exception {
        mockMvc.perform(get(BASE)).andExpect(status().isUnauthorized());
        mockMvc.perform(get(BASE + "/disparadores")).andExpect(status().isUnauthorized());
        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content(VALID_CUESTIONARIO_JSON))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get(ASIGNACIONES + "/mis-pendientes")).andExpect(status().isUnauthorized());
        mockMvc.perform(get(REPORTES + "/resumen").param("cuestionarioId", SAMPLE_ID.toString()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "SOLICITANTE_MOVILIDAD")
    void usuarioAutenticadoComun_accedeAAsignacionesPeroRecibe403EnAdminYReportes() throws Exception {
        mockMvc.perform(get(ASIGNACIONES + "/mis-pendientes")).andExpect(status().isOk());
        mockMvc.perform(get(ASIGNACIONES + "/por-entidad")
                        .param("entidadTipo", "SOLICITUD_VEHICULAR")
                        .param("entidadId", SAMPLE_ID.toString()))
                .andExpect(status().isOk());
        mockMvc.perform(post(ASIGNACIONES + "/mis-asignaciones-lote")
                        .contentType(MediaType.APPLICATION_JSON).content(VALID_LOTE_JSON))
                .andExpect(status().isOk());
        mockMvc.perform(get(ASIGNACIONES + "/" + SAMPLE_ID)).andExpect(status().isOk());
        mockMvc.perform(post(ASIGNACIONES + "/" + SAMPLE_ID + "/responder")
                        .contentType(MediaType.APPLICATION_JSON).content(VALID_RESPONDER_JSON))
                .andExpect(status().isOk());

        mockMvc.perform(get(BASE)).andExpect(status().isForbidden());
        mockMvc.perform(get(BASE + "/disparadores")).andExpect(status().isForbidden());
        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content(VALID_CUESTIONARIO_JSON))
                .andExpect(status().isForbidden());
        mockMvc.perform(get(REPORTES + "/resumen").param("cuestionarioId", SAMPLE_ID.toString()))
                .andExpect(status().isForbidden());
        mockMvc.perform(get(REPORTES + "/respuestas").param("cuestionarioId", SAMPLE_ID.toString()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void supervisor_puedeLeerPlantillasYReportesPeroNoModificarNiVerDisparadores() throws Exception {
        mockMvc.perform(get(BASE)).andExpect(status().isOk());
        mockMvc.perform(get(BASE + "/" + SAMPLE_ID)).andExpect(status().isOk());
        mockMvc.perform(get(REPORTES + "/resumen").param("cuestionarioId", SAMPLE_ID.toString()))
                .andExpect(status().isOk());
        mockMvc.perform(get(REPORTES + "/respuestas").param("cuestionarioId", SAMPLE_ID.toString()))
                .andExpect(status().isOk());

        mockMvc.perform(get(BASE + "/disparadores")).andExpect(status().isForbidden());
        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content(VALID_CUESTIONARIO_JSON))
                .andExpect(status().isForbidden());
        mockMvc.perform(put(BASE + "/" + SAMPLE_ID).contentType(MediaType.APPLICATION_JSON).content(VALID_CUESTIONARIO_JSON))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete(BASE + "/" + SAMPLE_ID)).andExpect(status().isForbidden());
        mockMvc.perform(put(BASE + "/" + SAMPLE_ID + "/preguntas").contentType(MediaType.APPLICATION_JSON).content(VALID_PREGUNTAS_JSON))
                .andExpect(status().isForbidden());
        mockMvc.perform(post(BASE + "/" + SAMPLE_ID + "/publicar")).andExpect(status().isForbidden());
        mockMvc.perform(post(BASE + "/" + SAMPLE_ID + "/inactivar")).andExpect(status().isForbidden());
        mockMvc.perform(post(BASE + "/" + SAMPLE_ID + "/nueva-version")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void admin_accedeATodosLosEndpointsDeCuestionarios() throws Exception {
        mockMvc.perform(get(BASE)).andExpect(status().isOk());
        mockMvc.perform(get(BASE + "/disparadores")).andExpect(status().isOk());
        mockMvc.perform(get(BASE + "/" + SAMPLE_ID)).andExpect(status().isOk());
        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content(VALID_CUESTIONARIO_JSON))
                .andExpect(status().isCreated());
        mockMvc.perform(put(BASE + "/" + SAMPLE_ID).contentType(MediaType.APPLICATION_JSON).content(VALID_CUESTIONARIO_JSON))
                .andExpect(status().isOk());
        mockMvc.perform(put(BASE + "/" + SAMPLE_ID + "/preguntas").contentType(MediaType.APPLICATION_JSON).content(VALID_PREGUNTAS_JSON))
                .andExpect(status().isOk());
        mockMvc.perform(post(BASE + "/" + SAMPLE_ID + "/publicar").param("reemplazarActivo", "true"))
                .andExpect(status().isOk());
        mockMvc.perform(post(BASE + "/" + SAMPLE_ID + "/inactivar")).andExpect(status().isOk());
        mockMvc.perform(post(BASE + "/" + SAMPLE_ID + "/nueva-version")).andExpect(status().isCreated());
        mockMvc.perform(delete(BASE + "/" + SAMPLE_ID)).andExpect(status().isOk());
        mockMvc.perform(get(REPORTES + "/resumen").param("cuestionarioId", SAMPLE_ID.toString()))
                .andExpect(status().isOk());
        mockMvc.perform(get(REPORTES + "/respuestas").param("cuestionarioId", SAMPLE_ID.toString()))
                .andExpect(status().isOk());
    }
}
