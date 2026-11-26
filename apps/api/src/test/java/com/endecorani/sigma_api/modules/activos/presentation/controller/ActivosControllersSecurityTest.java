package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.config.security.KeycloakJwtAuthenticationConverter;
import com.endecorani.sigma_api.config.security.RestAccessDeniedHandler;
import com.endecorani.sigma_api.config.security.RestAuthenticationEntryPoint;
import com.endecorani.sigma_api.config.security.SecurityConfig;
import com.endecorani.sigma_api.modules.activos.application.service.AccesorioService;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoAccesorioService;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoAtributoValorService;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoAsignacionService;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoDocumentoService;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoService;
import com.endecorani.sigma_api.modules.activos.application.service.CategoriaService;
import com.endecorani.sigma_api.modules.activos.application.service.ComponenteService;
import com.endecorani.sigma_api.modules.activos.application.service.TipoActivoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import tools.jackson.databind.json.JsonMapper;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * REQ-BIZ-001: verifica 401 (sin JWT), 403 (JWT sin ADMIN) y accesos permitidos
 * usando el mismo {@link SecurityConfig} de producción, con un JwtDecoder que
 * sólo cambia el claim de roles.
 */
@WebAppConfiguration
@SpringJUnitConfig(classes = ActivosControllersSecurityTest.TestConfig.class)
class ActivosControllersSecurityTest {

    private static final String ADMIN = "Bearer admin";
    private static final String OPERADOR = "Bearer operador";

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ActivoService activoService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        when(activoService.exportarDisponibilidadExcel(any(), any(), any(), any(), any(), any()))
                .thenReturn(new byte[]{1, 2, 3, 4});
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

        /** Necesario para que MockMvc resuelva el multipart del endpoint de imagen. */
        @Bean
        StandardServletMultipartResolver multipartResolver() {
            return new StandardServletMultipartResolver();
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

        /** "admin" produce rol ADMIN; cualquier otro token, OPERADOR. */
        @Bean
        JwtDecoder jwtDecoder() {
            return token -> Jwt.withTokenValue(token)
                    .header("alg", "none")
                    .claim("sub", "user-" + token)
                    .claim("preferred_username", token)
                    .claim("realm_access", Map.of(
                            "roles", List.of("admin".equals(token) ? "ADMIN" : "OPERADOR")))
                    .issuedAt(Instant.now())
                    .expiresAt(Instant.now().plusSeconds(3600))
                    .build();
        }

        @Bean ActivoService activoService() { return mock(ActivoService.class); }
        @Bean CategoriaService categoriaService() { return mock(CategoriaService.class); }
        @Bean TipoActivoService tipoActivoService() { return mock(TipoActivoService.class); }
        @Bean ComponenteService componenteService() { return mock(ComponenteService.class); }
        @Bean ActivoAsignacionService activoAsignacionService() { return mock(ActivoAsignacionService.class); }
        @Bean ActivoAtributoValorService activoAtributoValorService() {
            return mock(ActivoAtributoValorService.class);
        }
        @Bean ActivoDocumentoService activoDocumentoService() { return mock(ActivoDocumentoService.class); }
        @Bean AccesorioService accesorioService() { return mock(AccesorioService.class); }
        @Bean ActivoAccesorioService activoAccesorioService() { return mock(ActivoAccesorioService.class); }

        @Bean ActivoController activoController(ActivoService service) { return new ActivoController(service); }
        @Bean CategoriaController categoriaController(CategoriaService service) { return new CategoriaController(service); }
        @Bean TipoActivoController tipoActivoController(TipoActivoService service) { return new TipoActivoController(service); }
        @Bean ComponenteController componenteController(ComponenteService service) { return new ComponenteController(service); }
        @Bean ActivoAsignacionController activoAsignacionController(ActivoAsignacionService service) {
            return new ActivoAsignacionController(service);
        }
        @Bean ActivoAtributoValorController activoAtributoValorController(ActivoAtributoValorService service) {
            return new ActivoAtributoValorController(service);
        }
        @Bean ActivoDocumentoController activoDocumentoController(ActivoDocumentoService service) {
            return new ActivoDocumentoController(service);
        }
        @Bean AccesorioController accesorioController(AccesorioService service) { return new AccesorioController(service); }
        @Bean ActivoAccesorioController activoAccesorioController(ActivoAccesorioService service) {
            return new ActivoAccesorioController(service);
        }
    }

    @Test
    void sinJwt_mutacionesYLecturasDevuelven401() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/activos/{id}", id))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/api/v1/categorias/{id}", id))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/activos"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void jwtOperador_mutacionesDeCatalogoYEliminacionesDevuelven403() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(post("/api/v1/activos")
                        .header(HttpHeaders.AUTHORIZATION, OPERADOR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"ACT-001\",\"nombre\":\"Activo de prueba\","
                                + "\"tipoActivoId\":\"" + UUID.randomUUID() + "\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/v1/categorias")
                        .header(HttpHeaders.AUTHORIZATION, OPERADOR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"PRUEBA\",\"nombre\":\"Categoría de prueba\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/api/v1/categorias/{id}", id)
                        .header(HttpHeaders.AUTHORIZATION, OPERADOR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"PRUEBA\",\"nombre\":\"Categoría de prueba\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/activos/{id}", id).header(HttpHeaders.AUTHORIZATION, OPERADOR))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/categorias/{id}", id).header(HttpHeaders.AUTHORIZATION, OPERADOR))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/tipos-activo/{id}", id).header(HttpHeaders.AUTHORIZATION, OPERADOR))
                .andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/v1/activos/{id}/activo", id)
                        .header(HttpHeaders.AUTHORIZATION, OPERADOR))
                .andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/v1/activos/{id}/estado-operativo", id)
                        .header(HttpHeaders.AUTHORIZATION, OPERADOR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estadoOperativoId\":\"" + UUID.randomUUID() + "\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/v1/componentes/{id}/activo", id)
                        .header(HttpHeaders.AUTHORIZATION, OPERADOR))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/accesorios/{id}", id).header(HttpHeaders.AUTHORIZATION, OPERADOR))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/activo-accesorios/{id}", id).header(HttpHeaders.AUTHORIZATION, OPERADOR))
                .andExpect(status().isForbidden());
    }

    @Test
    void jwtOperador_eliminacionEnCrudOperativoHeredadoDevuelve403() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/activo-asignaciones/{id}", id)
                        .header(HttpHeaders.AUTHORIZATION, OPERADOR))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/activo-atributo-valores/{id}", id)
                        .header(HttpHeaders.AUTHORIZATION, OPERADOR))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/activo-documentos/{id}", id)
                        .header(HttpHeaders.AUTHORIZATION, OPERADOR))
                .andExpect(status().isForbidden());
    }

    @Test
    void jwtOperador_lecturasYMutacionesOperativasEstanPermitidas() throws Exception {
        UUID activoId = UUID.randomUUID();

        mockMvc.perform(get("/api/v1/activos").header(HttpHeaders.AUTHORIZATION, OPERADOR))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/categorias").header(HttpHeaders.AUTHORIZATION, OPERADOR))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/activo-asignaciones")
                        .header(HttpHeaders.AUTHORIZATION, OPERADOR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"activoId\":\"" + activoId + "\","
                                + "\"empleadoId\":\"" + UUID.randomUUID() + "\","
                                + "\"fechaAsignacion\":\"2026-01-10T08:00:00\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void jwtAdmin_puedeEliminarYEjecutarMutacionesDeCatalogo() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/activos/{id}", id).header(HttpHeaders.AUTHORIZATION, ADMIN))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/v1/categorias/{id}", id).header(HttpHeaders.AUTHORIZATION, ADMIN))
                .andExpect(status().isOk());
        mockMvc.perform(patch("/api/v1/activos/{id}/activo", id)
                        .header(HttpHeaders.AUTHORIZATION, ADMIN))
                .andExpect(status().isOk());
    }

    // REQ-BIZ-023: cobertura explícita de /resumen, /disponibilidad, export Excel e imagen.

    @Test
    void sinJwt_resumenDisponibilidadExportEImagenDevuelven401() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(get("/api/v1/activos/resumen"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/activos/disponibilidad"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/activos/disponibilidad/exportar-excel"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(multipart("/api/v1/activos/{id}/imagen", id).file(imagen()))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/api/v1/activos/{id}/imagen", id))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void jwtOperador_lecturaYExportPermitidosPeroImagenSinPermisoDevuelve403() throws Exception {
        UUID id = UUID.randomUUID();

        // Contrato de los tres endpoints de lectura: cualquier JWT válido (rol autenticado).
        mockMvc.perform(get("/api/v1/activos/resumen").header(HttpHeaders.AUTHORIZATION, OPERADOR))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/activos/disponibilidad").header(HttpHeaders.AUTHORIZATION, OPERADOR))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/activos/disponibilidad/exportar-excel")
                        .header(HttpHeaders.AUTHORIZATION, OPERADOR))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));

        // La imagen es administrativa: rol sin permiso => 403.
        mockMvc.perform(multipart("/api/v1/activos/{id}/imagen", id)
                        .file(imagen()).header(HttpHeaders.AUTHORIZATION, OPERADOR))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/activos/{id}/imagen", id)
                        .header(HttpHeaders.AUTHORIZATION, OPERADOR))
                .andExpect(status().isForbidden());
    }

    @Test
    void jwtAdmin_losCuatroEndpointsIncluidaImagenDevuelven200() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(get("/api/v1/activos/resumen").header(HttpHeaders.AUTHORIZATION, ADMIN))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/activos/disponibilidad").header(HttpHeaders.AUTHORIZATION, ADMIN))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/activos/disponibilidad/exportar-excel")
                        .header(HttpHeaders.AUTHORIZATION, ADMIN))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        mockMvc.perform(multipart("/api/v1/activos/{id}/imagen", id)
                        .file(imagen()).header(HttpHeaders.AUTHORIZATION, ADMIN))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/v1/activos/{id}/imagen", id)
                        .header(HttpHeaders.AUTHORIZATION, ADMIN))
                .andExpect(status().isOk());
    }

    private static MockMultipartFile imagen() {
        return new MockMultipartFile(
                "file", "foto.png", "image/png",
                new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A});
    }
}
