package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.security.KeycloakJwtAuthenticationConverter;
import com.endecorani.sigma_api.config.security.RestAccessDeniedHandler;
import com.endecorani.sigma_api.config.security.RestAuthenticationEntryPoint;
import com.endecorani.sigma_api.config.security.SecurityConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.request.OrdenTrabajoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response.OrdenTrabajoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.SolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.OrdenTrabajoService;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.SolicitudMantenimientoService;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteWorkflowTaskRequest;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * REQ-MANT-001: matriz de roles ejecutada sobre el {@link SecurityConfig} real
 * (401 sin token, 403 con rol excluido, 200/201 con rol autorizado).
 */
@WebAppConfiguration
@SpringJUnitConfig(classes = MantenimientoSecurityMatrixTest.TestConfig.class)
class MantenimientoSecurityMatrixTest {

    private static final String SOLICITUDES = "/api/v1/solicitudes-mantenimiento";
    private static final String ORDENES = "/api/v1/ordenes-trabajo";

    private static final String SOLICITUD_JSON = """
            {
              "activoId": "11111111-1111-4111-8111-111111111111",
              "tipoMantenimientoId": "22222222-2222-4222-8222-222222222222",
              "prioridadId": "33333333-3333-4333-8333-333333333333",
              "solicitanteId": "44444444-4444-4444-8444-444444444444",
              "titulo": "Falla hidráulica",
              "descripcion": "Revisión de la unidad"
            }
            """;

    private static final String ORDEN_JSON = """
            {
              "solicitudMantenimientoId": "11111111-1111-4111-8111-111111111111",
              "activoId": "22222222-2222-4222-8222-222222222222",
              "responsableId": "33333333-3333-4333-8333-333333333333"
            }
            """;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private SolicitudMantenimientoService solicitudMantenimientoService;

    @Autowired
    private OrdenTrabajoService ordenTrabajoService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        reset(solicitudMantenimientoService, ordenTrabajoService);
        when(solicitudMantenimientoService.findAll(any(), any(), any(), any(PageRequestDto.class)))
                .thenReturn(new PageResponse<>(List.of(), 0, 20, 0, 0, true, true, true));
        when(solicitudMantenimientoService.create(any(SolicitudMantenimientoRequest.class)))
                .thenReturn(null);
        when(ordenTrabajoService.listar(any(), any(), any(PageRequestDto.class)))
                .thenReturn(new PageResponse<>(List.of(), 0, 20, 0, 0, true, true, true));
        when(ordenTrabajoService.create(any(OrdenTrabajoRequest.class)))
                .thenReturn(null);
        when(solicitudMantenimientoService.completarWorkflow(any(), any(CompleteWorkflowTaskRequest.class)))
                .thenReturn(null);
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @Configuration
    @EnableWebMvc
    @EnableWebSecurity
    @Import(SecurityConfig.class)
    static class TestConfig {

        @Bean
        JsonMapper jsonMapper() {
            return JsonMapper.builder().build();
        }

        @Bean
        RestAuthenticationEntryPoint restAuthenticationEntryPoint(JsonMapper jsonMapper) {
            return new RestAuthenticationEntryPoint(jsonMapper);
        }

        @Bean
        RestAccessDeniedHandler restAccessDeniedHandler(JsonMapper jsonMapper) {
            return new RestAccessDeniedHandler(jsonMapper);
        }

        @Bean
        KeycloakJwtAuthenticationConverter keycloakJwtAuthenticationConverter() {
            return new KeycloakJwtAuthenticationConverter();
        }

        @Bean
        JwtDecoder jwtDecoder() {
            return mock(JwtDecoder.class);
        }

        @Bean
        SolicitudMantenimientoService solicitudMantenimientoService() {
            return mock(SolicitudMantenimientoService.class);
        }

        @Bean
        OrdenTrabajoService ordenTrabajoService() {
            return mock(OrdenTrabajoService.class);
        }

        @Bean
        SolicitudMantenimientoController solicitudMantenimientoController(SolicitudMantenimientoService service) {
            return new SolicitudMantenimientoController(service);
        }

        @Bean
        OrdenTrabajoController ordenTrabajoController(OrdenTrabajoService service) {
            return new OrdenTrabajoController(service);
        }

        @Bean
        MantenimientoWorkflowAccess mantenimientoWorkflowAccess() {
            return new MantenimientoWorkflowAccess();
        }
    }

    @Test
    void sinAutenticacion_devuelve401() throws Exception {
        mockMvc.perform(get(SOLICITUDES)).andExpect(status().isUnauthorized());
        mockMvc.perform(get(ORDENES)).andExpect(status().isUnauthorized());
        mockMvc.perform(post(SOLICITUDES)
                        .contentType(MediaType.APPLICATION_JSON).content(SOLICITUD_JSON))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post(ORDENES)
                        .contentType(MediaType.APPLICATION_JSON).content(ORDEN_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "CONDUCTOR")
    void rolExcluido_devuelve403() throws Exception {
        mockMvc.perform(get(SOLICITUDES)).andExpect(status().isForbidden());
        mockMvc.perform(get(ORDENES)).andExpect(status().isForbidden());
        mockMvc.perform(post(SOLICITUDES)
                        .contentType(MediaType.APPLICATION_JSON).content(SOLICITUD_JSON))
                .andExpect(status().isForbidden());
        mockMvc.perform(post(ORDENES)
                        .contentType(MediaType.APPLICATION_JSON).content(ORDEN_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SOLICITANTE_MOVILIDAD")
    void rolSolicitanteMovilidad_devuelve403() throws Exception {
        mockMvc.perform(get(SOLICITUDES)).andExpect(status().isForbidden());
        mockMvc.perform(post(SOLICITUDES)
                        .contentType(MediaType.APPLICATION_JSON).content(SOLICITUD_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SOLICITANTE")
    void solicitante_puedeLeerYCrearSolicitudesPeroNoOrdenes() throws Exception {
        mockMvc.perform(get(SOLICITUDES)).andExpect(status().isOk());
        mockMvc.perform(post(SOLICITUDES)
                        .contentType(MediaType.APPLICATION_JSON).content(SOLICITUD_JSON))
                .andExpect(status().isCreated());
        mockMvc.perform(get(ORDENES)).andExpect(status().isOk());
        mockMvc.perform(post(ORDENES)
                        .contentType(MediaType.APPLICATION_JSON).content(ORDEN_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void supervisor_puedeLeerPeroNoCrearSolicitudesNiOrdenes() throws Exception {
        mockMvc.perform(get(SOLICITUDES)).andExpect(status().isOk());
        mockMvc.perform(get(ORDENES)).andExpect(status().isOk());
        mockMvc.perform(post(SOLICITUDES)
                        .contentType(MediaType.APPLICATION_JSON).content(SOLICITUD_JSON))
                .andExpect(status().isForbidden());
        mockMvc.perform(post(ORDENES)
                        .contentType(MediaType.APPLICATION_JSON).content(ORDEN_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ENCARGADO")
    void encargado_puedeGestionarOrdenesPeroNoCrearSolicitudes() throws Exception {
        mockMvc.perform(get(SOLICITUDES)).andExpect(status().isOk());
        mockMvc.perform(get(ORDENES)).andExpect(status().isOk());
        mockMvc.perform(post(SOLICITUDES)
                        .contentType(MediaType.APPLICATION_JSON).content(SOLICITUD_JSON))
                .andExpect(status().isForbidden());
        mockMvc.perform(post(ORDENES)
                        .contentType(MediaType.APPLICATION_JSON).content(ORDEN_JSON))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void admin_puedeTodo() throws Exception {
        mockMvc.perform(get(SOLICITUDES)).andExpect(status().isOk());
        mockMvc.perform(get(ORDENES)).andExpect(status().isOk());
        mockMvc.perform(post(SOLICITUDES)
                        .contentType(MediaType.APPLICATION_JSON).content(SOLICITUD_JSON))
                .andExpect(status().isCreated());
        mockMvc.perform(post(ORDENES)
                        .contentType(MediaType.APPLICATION_JSON).content(ORDEN_JSON))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "ENCARGADO")
    void ordenTrabajo_mockMvcAceptaTresFormatosDeFecha() throws Exception {
        List<String> formatos = List.of(
                "2026-11-26T10:00:00",
                "2026-11-26T14:00:00Z",
                "2026-11-26T10:00:00-04:00"
        );

        for (String formato : formatos) {
            String json = ORDEN_JSON.replace("\"responsableId\": \"33333333-3333-4333-8333-333333333333\"",
                    "\"responsableId\": \"33333333-3333-4333-8333-333333333333\", \"fechaInicio\": \"" + formato + "\"");

            mockMvc.perform(post(ORDENES)
                            .contentType(MediaType.APPLICATION_JSON).content(json))
                    .andExpect(status().isCreated());
        }

        ArgumentCaptor<OrdenTrabajoRequest> captor = ArgumentCaptor.forClass(OrdenTrabajoRequest.class);
        verify(ordenTrabajoService, org.mockito.Mockito.times(3)).create(captor.capture());
        assertEquals(LocalDateTime.of(2026, 11, 26, 10, 0), captor.getAllValues().get(0).fechaInicio());
        assertEquals(LocalDateTime.of(2026, 11, 26, 10, 0), captor.getAllValues().get(1).fechaInicio());
        assertEquals(LocalDateTime.of(2026, 11, 26, 10, 0), captor.getAllValues().get(2).fechaInicio());
    }

    @Test
    @WithMockUser(roles = "SOLICITANTE")
    void aprobacionPorSolicitante_debeNegar403() throws Exception {
        mockMvc.perform(post(SOLICITUDES + "/" + UUID.randomUUID() + "/workflow/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variables\":{\"decisionCoordinador\":\"APROBAR\"}}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void aprobacionPorSupervisor_debePermitir200() throws Exception {
        mockMvc.perform(post(SOLICITUDES + "/" + UUID.randomUUID() + "/workflow/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variables\":{\"decisionCoordinador\":\"APROBAR\"}}"))
                .andExpect(status().isOk());
    }
}
