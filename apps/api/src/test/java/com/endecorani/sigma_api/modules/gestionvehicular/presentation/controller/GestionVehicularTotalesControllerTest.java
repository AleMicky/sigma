package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.security.KeycloakJwtAuthenticationConverter;
import com.endecorani.sigma_api.config.security.RestAccessDeniedHandler;
import com.endecorani.sigma_api.config.security.RestAuthenticationEntryPoint;
import com.endecorani.sigma_api.config.security.SecurityConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.reporte.TotalesGestionVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.GestionVehicularTotalesService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** REQ-VEH-009: contrato HTTP y matriz de roles del endpoint de totales. */
@WebAppConfiguration
@SpringJUnitConfig(classes = GestionVehicularTotalesControllerTest.TestConfig.class)
class GestionVehicularTotalesControllerTest {

    private static final String TOTALES = "/api/v1/reportes/gestion-vehicular/totales?modulo=combustible";

    @Autowired
    private WebApplicationContext context;
    @Autowired
    private GestionVehicularTotalesService service;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        when(service.obtener(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new TotalesGestionVehicularResponse(
                        1001L, new BigDecimal("2500.500"), new BigDecimal("18000.75"), 0L, null, null));
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
        GestionVehicularTotalesService totalesService() {
            return mock(GestionVehicularTotalesService.class);
        }

        @Bean
        GestionVehicularTotalesController totalesController(GestionVehicularTotalesService service) {
            return new GestionVehicularTotalesController(service);
        }
    }

    @Test
    void sinAutenticacion_devuelve401() throws Exception {
        mockMvc.perform(get(TOTALES)).andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "OPERADOR")
    void rolNoAutorizado_devuelve403() throws Exception {
        mockMvc.perform(get(TOTALES)).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void supervisorPuedeLeerTotalesConFormatoAcordado() throws Exception {
        mockMvc.perform(get(TOTALES))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalRegistros").value(1001))
                .andExpect(jsonPath("$.data.totalLitros").value(2500.500))
                .andExpect(jsonPath("$.data.totalImporte").value(18000.75))
                .andExpect(jsonPath("$.data.totalKm").value(0));
    }
}
