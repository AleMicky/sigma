package com.endecorani.sigma_api.modules.seguridad.presentation.controller;

import com.endecorani.sigma_api.config.keycloak.KeycloakProperties;
import com.endecorani.sigma_api.config.security.KeycloakJwtAuthenticationConverter;
import com.endecorani.sigma_api.config.security.RestAccessDeniedHandler;
import com.endecorani.sigma_api.config.security.RestAuthenticationEntryPoint;
import com.endecorani.sigma_api.config.security.SecurityConfig;
import com.endecorani.sigma_api.modules.seguridad.application.service.MenuService;
import com.endecorani.sigma_api.modules.seguridad.application.service.PermisoService;
import com.endecorani.sigma_api.modules.seguridad.application.service.RolMenuService;
import com.endecorani.sigma_api.modules.seguridad.application.service.RolService;
import com.endecorani.sigma_api.modules.seguridad.application.service.RolSyncService;
import com.endecorani.sigma_api.modules.seguridad.application.service.UsuarioService;
import com.endecorani.sigma_api.modules.seguridad.application.service.UsuarioSyncService;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.client.KeycloakRolClient;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.client.KeycloakUsuarioClient;
import com.endecorani.sigma_api.shared.presentation.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * REQ-SEG-004: matriz HTTP completa de los 33 endpoints de seguridad ejecutada contra el
 * {@link SecurityConfig} real ( nunca {@code standaloneSetup}): 401 anónimo, 403 no-admin,
 * 200/201 admin y {@code mis-menus} sólo autenticado.
 */
@WebAppConfiguration
@SpringJUnitConfig(classes = SeguridadControllersHttpSecurityMatrixTest.TestConfig.class)
class SeguridadControllersHttpSecurityMatrixTest {

    private static final String ID = "11111111-1111-4111-8111-111111111111";
    private static final String USUARIOS = "/api/v1/usuarios";
    private static final String ROLES = "/api/v1/roles";
    private static final String MENUS = "/api/v1/menus";
    private static final String PERMISOS = "/api/v1/permisos";

    private static final String MENU_JSON = """
            {"codigo":"TEST","nombre":"Test","tipo":"ITEM","ruta":"/test","orden":1,"activo":true}
            """;
    private static final String PERMISO_JSON = """
            {"menuId":"%s","codigo":"TEST_PERM","nombre":"Test","metodoHttp":"GET","ruta":"/api/v1/test","activo":true}
            """.formatted(ID);
    private static final String PERSONA_JSON = """
            {"personaId":"%s"}
            """.formatted(ID);
    private static final String MENUS_JSON = """
            {"menuIds":[]}
            """;

    /** Los 33 endpoints de seguridad: método, ruta, body y status esperado con rol ADMIN. */
    private static final List<Endpoint> ENDPOINTS = List.of(
            new Endpoint(HttpMethod.GET, USUARIOS, null, 200),
            new Endpoint(HttpMethod.GET, USUARIOS + "?q=admin", null, 200),
            new Endpoint(HttpMethod.GET, USUARIOS + "/" + ID, null, 200),
            new Endpoint(HttpMethod.POST, USUARIOS + "/sincronizar", null, 200),
            new Endpoint(HttpMethod.PUT, USUARIOS + "/" + ID + "/persona", PERSONA_JSON, 200),

            new Endpoint(HttpMethod.GET, ROLES, null, 200),
            new Endpoint(HttpMethod.GET, ROLES + "?q=ADMIN", null, 200),
            new Endpoint(HttpMethod.GET, ROLES + "/todos", null, 200),
            new Endpoint(HttpMethod.GET, ROLES + "/" + ID, null, 200),
            new Endpoint(HttpMethod.GET, ROLES + "/" + ID + "/usuarios", null, 200),
            new Endpoint(HttpMethod.POST, ROLES + "/sincronizar", null, 200),

            new Endpoint(HttpMethod.GET, ROLES + "/" + ID + "/menus", null, 200),
            new Endpoint(HttpMethod.GET, ROLES + "/" + ID + "/menus/ids", null, 200),
            new Endpoint(HttpMethod.GET, ROLES + "/" + ID + "/menus/arbol", null, 200),
            new Endpoint(HttpMethod.PUT, ROLES + "/" + ID + "/menus", MENUS_JSON, 200),

            new Endpoint(HttpMethod.GET, "/api/v1/admin/keycloak/test-usuarios", null, 200),
            new Endpoint(HttpMethod.GET, "/api/v1/admin/keycloak/test-roles", null, 200),

            new Endpoint(HttpMethod.POST, MENUS, MENU_JSON, 201),
            new Endpoint(HttpMethod.PUT, MENUS + "/" + ID, MENU_JSON, 200),
            new Endpoint(HttpMethod.DELETE, MENUS + "/" + ID, null, 200),
            new Endpoint(HttpMethod.GET, MENUS + "/" + ID, null, 200),
            new Endpoint(HttpMethod.GET, MENUS, null, 200),
            new Endpoint(HttpMethod.GET, MENUS + "?q=test", null, 200),
            new Endpoint(HttpMethod.GET, MENUS + "/todos", null, 200),
            new Endpoint(HttpMethod.GET, MENUS + "/arbol", null, 200),
            new Endpoint(HttpMethod.GET, MENUS + "/mis-menus", null, 200),

            new Endpoint(HttpMethod.POST, PERMISOS, PERMISO_JSON, 201),
            new Endpoint(HttpMethod.PUT, PERMISOS + "/" + ID, PERMISO_JSON, 200),
            new Endpoint(HttpMethod.DELETE, PERMISOS + "/" + ID, null, 200),
            new Endpoint(HttpMethod.GET, PERMISOS + "/" + ID, null, 200),
            new Endpoint(HttpMethod.GET, PERMISOS, null, 200),
            new Endpoint(HttpMethod.GET, PERMISOS + "/todos", null, 200),
            new Endpoint(HttpMethod.GET, PERMISOS + "/todos/menu/" + ID, null, 200)
    );

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private RolMenuService rolMenuService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @Configuration
    @EnableWebMvc
    @EnableWebSecurity
    @Import({SecurityConfig.class, GlobalExceptionHandler.class})
    static class TestConfig {

        @Bean
        JsonMapper jsonMapper() {
            return JsonMapper.builder().build();
        }

        @Bean
        KeycloakProperties keycloakProperties() {
            return new KeycloakProperties(
                    "http://keycloak.test", "sigma", null, null, "sigma-web", null, "sigma-web");
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
        KeycloakJwtAuthenticationConverter keycloakJwtAuthenticationConverter(KeycloakProperties properties) {
            return new KeycloakJwtAuthenticationConverter(properties);
        }

        @Bean
        JwtDecoder jwtDecoder() {
            return mock(JwtDecoder.class);
        }

        @Bean
        UsuarioService usuarioService() {
            return mock(UsuarioService.class);
        }

        @Bean
        UsuarioSyncService usuarioSyncService() {
            return mock(UsuarioSyncService.class);
        }

        @Bean
        RolService rolService() {
            return mock(RolService.class);
        }

        @Bean
        RolSyncService rolSyncService() {
            return mock(RolSyncService.class);
        }

        @Bean
        RolMenuService rolMenuService() {
            return mock(RolMenuService.class);
        }

        @Bean
        MenuService menuService() {
            return mock(MenuService.class);
        }

        @Bean
        PermisoService permisoService() {
            return mock(PermisoService.class);
        }

        @Bean
        KeycloakUsuarioClient keycloakUsuarioClient() {
            return mock(KeycloakUsuarioClient.class);
        }

        @Bean
        KeycloakRolClient keycloakRolClient() {
            return mock(KeycloakRolClient.class);
        }

        @Bean
        UsuarioController usuarioController(UsuarioService service, UsuarioSyncService syncService) {
            return new UsuarioController(service, syncService);
        }

        @Bean
        RolController rolController(RolService service, RolSyncService syncService) {
            return new RolController(service, syncService);
        }

        @Bean
        RolMenuController rolMenuController(RolMenuService service) {
            return new RolMenuController(service);
        }

        @Bean
        MenuController menuController(MenuService service, RolMenuService rolMenuService) {
            return new MenuController(service, rolMenuService);
        }

        @Bean
        PermisoController permisoController(PermisoService service) {
            return new PermisoController(service);
        }

        @Bean
        KeycloakTestController keycloakTestController(
                KeycloakUsuarioClient usuarioClient, KeycloakRolClient rolClient) {
            return new KeycloakTestController(usuarioClient, rolClient);
        }
    }

    @Test
    void matriz_debeCubrirLos33EndpointsDeSeguridad() {
        assertEquals(33, ENDPOINTS.size());
    }

    @Test
    void sinAutenticacion_los33Endpoints_debenResponder401Estable() throws Exception {
        assertEquals(33, ENDPOINTS.size());
        for (Endpoint endpoint : ENDPOINTS) {
            mockMvc.perform(buildRequest(endpoint))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
                    .andExpect(jsonPath("$.message")
                            .value("Debe autenticarse para acceder a este recurso"));
        }
    }

    @Test
    @WithMockUser(username = "operador", roles = "OPERADOR")
    void rolNoAdmin_los32EndpointsAdministrativos_debenResponder403() throws Exception {
        assertEquals(33, ENDPOINTS.size());
        for (Endpoint endpoint : ENDPOINTS) {
            if (endpoint.path().equals(MENUS + "/mis-menus")) {
                continue;
            }
            mockMvc.perform(buildRequest(endpoint)).andExpect(status().isForbidden());
        }
    }

    @Test
    @WithMockUser(username = "operador", roles = "OPERADOR")
    void rolNoAdmin_misMenus_debeResponder200() throws Exception {
        mockMvc.perform(buildRequest(endpoint(MENUS + "/mis-menus")))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void rolAdmin_los33Endpoints_debenResponder200O201() throws Exception {
        assertEquals(33, ENDPOINTS.size());
        for (Endpoint endpoint : ENDPOINTS) {
            mockMvc.perform(buildRequest(endpoint)).andExpect(status().is(endpoint.adminStatus()));
        }
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void putMenusSinMenuIds_debeResponder400ValidationErrorSinLlamarAlServicio() throws Exception {
        reset(rolMenuService);

        mockMvc.perform(request(HttpMethod.PUT, ROLES + "/" + ID + "/menus")
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));

        mockMvc.perform(request(HttpMethod.PUT, ROLES + "/" + ID + "/menus")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"menuIds\":null}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));

        verify(rolMenuService, never()).asignarMenus(any(), any());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void putMenusConListaVacia_debeResponder200YLlamarAlServicio() throws Exception {
        reset(rolMenuService);

        mockMvc.perform(request(HttpMethod.PUT, ROLES + "/" + ID + "/menus")
                        .contentType(MediaType.APPLICATION_JSON).content(MENUS_JSON))
                .andExpect(status().isOk());

        verify(rolMenuService).asignarMenus(any(), any());
    }

    private static Endpoint endpoint(String path) {
        return ENDPOINTS.stream()
                .filter(candidate -> candidate.path().equals(path))
                .findFirst()
                .orElseThrow();
    }

    private static MockHttpServletRequestBuilder buildRequest(Endpoint endpoint) {
        MockHttpServletRequestBuilder builder = request(endpoint.method(), endpoint.path());
        if (endpoint.body() != null) {
            builder.contentType(MediaType.APPLICATION_JSON).content(endpoint.body());
        }
        return builder;
    }

    private record Endpoint(HttpMethod method, String path, String body, int adminStatus) {
    }
}
