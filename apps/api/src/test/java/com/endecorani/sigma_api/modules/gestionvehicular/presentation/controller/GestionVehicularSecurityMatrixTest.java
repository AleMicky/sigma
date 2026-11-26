package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.security.KeycloakJwtAuthenticationConverter;
import com.endecorani.sigma_api.config.security.RestAccessDeniedHandler;
import com.endecorani.sigma_api.config.security.RestAuthenticationEntryPoint;
import com.endecorani.sigma_api.config.security.SecurityConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response.RegistroPorteriaResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.CargaCombustibleService;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.GestionVehicularDashboardService;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.RegistroPorteriaService;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.SolicitudVehicularService;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.ViajeVehicularService;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.TipoMovimientoPorteria;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
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

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * REQ-VEH-002: matriz de roles ejecutada sobre el {@link SecurityConfig} real
 * (401 sin autenticación, 403 con rol no autorizado, 200 con rol permitido).
 *
 * <p>Nota: Spring Boot 4.1 no incluye la anotación {@code @WebMvcTest} en
 * {@code spring-boot-starter-test} (está en el módulo opcional
 * {@code spring-boot-webmvc-test}). Para no modificar {@code pom.xml} se usa el
 * mismo patrón que ya usa la API: {@code @SpringJUnitConfig} + {@code @EnableWebMvc}
 * + {@code @EnableWebSecurity} + {@code @Import(SecurityConfig.class)} y MockMvc
 * con {@code springSecurity()}.</p>
 */
@WebAppConfiguration
@SpringJUnitConfig(classes = GestionVehicularSecurityMatrixTest.TestConfig.class)
class GestionVehicularSecurityMatrixTest {

    private static final String SOLICITUDES = "/api/v1/solicitudes-vehiculares";
    private static final String PORTERIA = "/api/v1/porteria";
    private static final String PORTERIA_REPORTE_PAGINADO = PORTERIA + "/reporte/paginado";
    private static final String DASHBOARD = "/api/v1/gestion-vehicular/dashboard";

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private RegistroPorteriaService registroPorteriaService;
    @Autowired
    private CargaCombustibleService cargaCombustibleService;
    @Autowired
    private ViajeVehicularService viajeVehicularService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        RegistroPorteriaResponse respuesta = new RegistroPorteriaResponse(
                null, null, TipoMovimientoPorteria.SALIDA,
                null, null, null,                       // esExterno, personaExterna, placaExterna
                null, null, null, null, null,           // origen/destino
                null, null, null, null, null, null,     // empleado/guardias
                null, null, null,                       // salidaVehicularId, fechaSalida, fechaLlegada
                null, null, null,                       // estado, observaciones
                List.of(), null, null                   // activos, auditoría
        );
        when(registroPorteriaService.registrarSalida(any())).thenReturn(respuesta);
        when(registroPorteriaService.generarReporteBitacoraPaginado(anyInt(), anyInt()))
                .thenReturn(new PageResponse<>(List.of(), 0, 20, 0, 0, true, true, true));
        when(registroPorteriaService.generarReporteBitacoraPaginado(
                anyInt(), anyInt(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new PageResponse<>(List.of(), 0, 20, 0, 0, true, true, true));
        when(cargaCombustibleService.exportarExcel(any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new byte[]{1, 2, 3});
        when(viajeVehicularService.exportarExcel(any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new byte[]{1, 2, 3});
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
        SolicitudVehicularService solicitudVehicularService() {
            return mock(SolicitudVehicularService.class);
        }

        @Bean
        RegistroPorteriaService registroPorteriaService() {
            return mock(RegistroPorteriaService.class);
        }

        @Bean
        GestionVehicularDashboardService dashboardService() {
            return mock(GestionVehicularDashboardService.class);
        }

        @Bean
        CargaCombustibleService cargaCombustibleService() {
            return mock(CargaCombustibleService.class);
        }

        @Bean
        ViajeVehicularService viajeVehicularService() {
            return mock(ViajeVehicularService.class);
        }

        @Bean
        SolicitudVehicularController solicitudVehicularController(SolicitudVehicularService service) {
            return new SolicitudVehicularController(service);
        }

        @Bean
        RegistroPorteriaController registroPorteriaController(RegistroPorteriaService service) {
            return new RegistroPorteriaController(service);
        }

        @Bean
        GestionVehicularDashboardController dashboardController(GestionVehicularDashboardService service) {
            return new GestionVehicularDashboardController(service);
        }

        @Bean
        CargaCombustibleController cargaCombustibleController(CargaCombustibleService service) {
            return new CargaCombustibleController(service);
        }

        @Bean
        ViajeVehicularController viajeVehicularController(ViajeVehicularService service) {
            return new ViajeVehicularController(service);
        }
    }

    @Test
    void sinAutenticacion_devuelve401() throws Exception {
        mockMvc.perform(get(SOLICITUDES)).andExpect(status().isUnauthorized());
        mockMvc.perform(post(PORTERIA + "/salidas")
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get(DASHBOARD)).andExpect(status().isUnauthorized());
        mockMvc.perform(get(PORTERIA_REPORTE_PAGINADO)).andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "OPERADOR")
    void rolNoAutorizado_devuelve403() throws Exception {
        mockMvc.perform(get(SOLICITUDES)).andExpect(status().isForbidden());
        mockMvc.perform(post(PORTERIA + "/salidas")
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get(DASHBOARD)).andExpect(status().isForbidden());
        mockMvc.perform(get(PORTERIA_REPORTE_PAGINADO)).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SOLICITANTE_MOVILIDAD")
    void solicitante_puedeGestionarSolicitudesYLeerReportesPeroNoPorteria() throws Exception {
        mockMvc.perform(get(SOLICITUDES)).andExpect(status().isOk());
        mockMvc.perform(post(PORTERIA + "/salidas")
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get(DASHBOARD)).andExpect(status().isOk());
        mockMvc.perform(get(PORTERIA_REPORTE_PAGINADO)).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/cargas-combustible/exportar-excel")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "CONDUCTOR")
    void conductor_puedeGestionarSolicitudesYLeerReportesPeroNoPorteria() throws Exception {
        mockMvc.perform(get(SOLICITUDES)).andExpect(status().isOk());
        mockMvc.perform(post(PORTERIA + "/salidas")
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get(DASHBOARD)).andExpect(status().isOk());
        mockMvc.perform(get(PORTERIA_REPORTE_PAGINADO)).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/viajes-vehiculares/exportar-excel")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void supervisor_soloAccedeAReportesDashboardYExport() throws Exception {
        mockMvc.perform(get(DASHBOARD)).andExpect(status().isOk());
        mockMvc.perform(get(PORTERIA_REPORTE_PAGINADO)).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/viajes-vehiculares/exportar-excel")).andExpect(status().isOk());
        mockMvc.perform(get(SOLICITUDES)).andExpect(status().isForbidden());
        mockMvc.perform(post(PORTERIA + "/salidas")
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ENCARGADO_MOVILIDADES")
    void encargado_accedeASolicitudesPorteriaYReportes() throws Exception {
        mockMvc.perform(get(SOLICITUDES)).andExpect(status().isOk());
        mockMvc.perform(post(PORTERIA + "/salidas")
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isCreated());
        mockMvc.perform(get(DASHBOARD)).andExpect(status().isOk());
        mockMvc.perform(get(PORTERIA_REPORTE_PAGINADO)).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/cargas-combustible/exportar-excel")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void admin_accedeATodasLasOperaciones() throws Exception {
        mockMvc.perform(get(SOLICITUDES)).andExpect(status().isOk());
        mockMvc.perform(post(PORTERIA + "/salidas")
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isCreated());
        mockMvc.perform(get(DASHBOARD)).andExpect(status().isOk());
        mockMvc.perform(get(PORTERIA_REPORTE_PAGINADO)).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/viajes-vehiculares/exportar-excel")).andExpect(status().isOk());
    }

    @Test
    void sinAutenticacion_paginadoConFiltros_devuelve401() throws Exception {
        mockMvc.perform(get(PORTERIA_REPORTE_PAGINADO)
                        .param("activoId", UUID.randomUUID().toString())
                        .param("estado", "AFUERA")
                        .param("size", "5"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "OPERADOR")
    void rolNoAutorizado_paginadoConFiltros_devuelve403() throws Exception {
        mockMvc.perform(get(PORTERIA_REPORTE_PAGINADO)
                        .param("activoId", UUID.randomUUID().toString())
                        .param("estado", "AFUERA")
                        .param("size", "5"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void supervisor_paginadoConFiltros_devuelve200() throws Exception {
        mockMvc.perform(get(PORTERIA_REPORTE_PAGINADO)
                        .param("search", "ABC-123")
                        .param("activoId", UUID.randomUUID().toString())
                        .param("esExterno", "false")
                        .param("estado", "COMPLETADO")
                        .param("fechaDesde", "2026-11-26T00:00:00Z")
                        .param("page", "0")
                        .param("size", "5"))
                .andExpect(status().isOk());
    }
}
