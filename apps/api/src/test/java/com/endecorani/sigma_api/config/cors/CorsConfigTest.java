package com.endecorani.sigma_api.config.cors;

import org.junit.jupiter.api.Test;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CorsConfigTest {

    private final CorsConfig corsConfig = new CorsConfig();

    @Test
    void corsConfigurationSource_conOrigenesExplicitos_permiteCredencialesYLimpiaEspacios() {
        CorsProperties properties = new CorsProperties(List.of(
                "  https://sigma.endecorani.bo , , http://localhost:5173  ",
                "   ",
                "https://sigma.endecorani.bo"
        ));

        CorsConfigurationSource source = corsConfig.corsConfigurationSource(properties);
        CorsConfiguration config = source.getCorsConfiguration(new MockHttpServletRequest("GET", "/api/v1/activos"));

        assertNotNull(config);
        assertEquals(List.of("https://sigma.endecorani.bo", "http://localhost:5173"), config.getAllowedOrigins());
        assertNull(config.getAllowedOriginPatterns());
        assertEquals(Boolean.TRUE, config.getAllowCredentials());
        assertEquals(List.of("Content-Disposition", "Content-Type", "Authorization"), config.getExposedHeaders());
        assertFalse(config.getExposedHeaders().contains("*"));
        assertDoesNotThrow(config::validateAllowCredentials);
    }

    @Test
    void corsConfigurationSource_conWildcardAsterisco_deshabilitaCredenciales() {
        CorsProperties properties = new CorsProperties(List.of("*"));

        CorsConfigurationSource source = corsConfig.corsConfigurationSource(properties);
        CorsConfiguration config = source.getCorsConfiguration(new MockHttpServletRequest("GET", "/api/v1/activos"));

        assertNotNull(config);
        assertEquals(List.of("*"), config.getAllowedOrigins());
        assertNull(config.getAllowedOriginPatterns());
        assertEquals(Boolean.FALSE, config.getAllowCredentials());
        assertEquals(List.of("Content-Disposition", "Content-Type", "Authorization"), config.getExposedHeaders());
        assertDoesNotThrow(config::validateAllowCredentials);
    }

    @Test
    void corsConfigurationSource_conListaMixtaIncluyendoAsterisco_deshabilitaCredenciales() {
        CorsProperties properties = new CorsProperties(List.of("https://sigma.endecorani.bo, *"));

        CorsConfigurationSource source = corsConfig.corsConfigurationSource(properties);
        CorsConfiguration config = source.getCorsConfiguration(new MockHttpServletRequest("GET", "/api/v1/activos"));

        assertNotNull(config);
        assertEquals(List.of("*"), config.getAllowedOrigins());
        assertEquals(Boolean.FALSE, config.getAllowCredentials());
        assertDoesNotThrow(config::validateAllowCredentials);
    }

    @Test
    void corsConfigurationSource_conOrigenesVaciosONulos_noPermiteWildcardNiCredenciales() {
        CorsConfigurationSource source = corsConfig.corsConfigurationSource(new CorsProperties(List.of("", "   ")));
        CorsConfiguration config = source.getCorsConfiguration(new MockHttpServletRequest("GET", "/api/v1/activos"));

        assertNotNull(config);
        assertNotNull(config.getAllowedOrigins());
        assertTrue(config.getAllowedOrigins().isEmpty());
        assertEquals(Boolean.FALSE, config.getAllowCredentials());
        assertDoesNotThrow(config::validateAllowCredentials);
    }

    @Test
    void perfilProdYaml_configuraFlywayEstrictoSinCredencialesPorDefectoNiSwagger() throws IOException {
        YamlPropertySourceLoader loader = new YamlPropertySourceLoader();
        List<PropertySource<?>> sources = loader.load("prod", new ClassPathResource("application-prod.yaml"));
        assertFalse(sources.isEmpty());
        PropertySource<?> prod = sources.getFirst();

        assertEquals(Boolean.TRUE, prod.getProperty("spring.flyway.validate-on-migrate"));
        assertEquals(Boolean.FALSE, prod.getProperty("spring.flyway.out-of-order"));
        assertEquals("", prod.getProperty("spring.flyway.ignore-migration-patterns"));
        assertEquals("${CORS_ALLOWED_ORIGINS}", prod.getProperty("app.cors.allowed-origins"));
        assertEquals("${DB_PASSWORD}", prod.getProperty("spring.datasource.password"));
        assertEquals("${FLOWABLE_PASSWORD}", prod.getProperty("flowable.password"));
        assertEquals(Boolean.FALSE, prod.getProperty("springdoc.api-docs.enabled"));
        assertEquals(Boolean.FALSE, prod.getProperty("springdoc.swagger-ui.enabled"));
    }
}
