package com.endecorani.sigma_api.config.security;

import com.endecorani.sigma_api.config.keycloak.KeycloakProperties;
import org.junit.jupiter.api.Test;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

/** REQ-SEG-008/010: configuración de audiencia, base URL, skew y Swagger por perfil. */
class KeycloakSecurityConfigurationTest {

    @Test
    void audienciaPorDefectoDebeSerSigmaApiSinAccount() throws IOException {
        String yaml = new ClassPathResource("application.yaml")
                .getContentAsString(StandardCharsets.UTF_8);
        PropertySource<?> source = load("application.yaml");

        assertEquals("${KEYCLOAK_AUDIENCE:sigma-api}",
                source.getProperty("app.keycloak.audience"));
        assertFalse(yaml.contains("- account"), "account no debe ser audiencia permitida");
        assertNull(source.getProperty("spring.security.oauth2.resourceserver.jwt.audiences[0]"));
    }

    @Test
    void baseUrlNoDebeTenerIpFijaYClockSkewDebeSerConfigurable() throws IOException {
        String yaml = new ClassPathResource("application.yaml")
                .getContentAsString(StandardCharsets.UTF_8);
        PropertySource<?> source = load("application.yaml");

        assertEquals("${KEYCLOAK_BASE_URL:}", source.getProperty("app.keycloak.base-url"));
        assertEquals("${KEYCLOAK_JWT_CLOCK_SKEW_SECONDS:60}",
                source.getProperty("app.keycloak.jwt-clock-skew-seconds"));
        assertFalse(yaml.contains("157.173.99.216"));
    }

    @Test
    void apiDocsYSwaggerSoloDebenHabilitarseEnElPerfilDev() throws IOException {
        PropertySource<?> base = load("application.yaml");
        PropertySource<?> dev = load("application-dev.yaml");
        PropertySource<?> prod = load("application-prod.yaml");

        assertEquals("false", String.valueOf(base.getProperty("springdoc.api-docs.enabled")));
        assertEquals("false", String.valueOf(base.getProperty("springdoc.swagger-ui.enabled")));
        assertEquals("true", String.valueOf(dev.getProperty("springdoc.api-docs.enabled")));
        assertEquals("true", String.valueOf(dev.getProperty("springdoc.swagger-ui.enabled")));
        assertEquals("false", String.valueOf(prod.getProperty("springdoc.api-docs.enabled")));
        assertEquals("false", String.valueOf(prod.getProperty("springdoc.swagger-ui.enabled")));
    }

    @Test
    void resolvedBaseUrlSinConfiguracion_debeFallarEnLugarDeUsarIpHardcodeada() {
        KeycloakProperties properties = new KeycloakProperties(
                null, null, null, null, "sigma-web", null, "sigma-api");

        IllegalStateException exception = assertThrows(IllegalStateException.class, properties::resolvedBaseUrl);
        assertFalse(exception.getMessage().contains("157.173.99.216"));
    }

    @Test
    void resolvedBaseUrlDebeUsarConfiguracionExplicitaODerivarDelTokenUrl() {
        KeycloakProperties explicita = new KeycloakProperties(
                "https://kc.sigma", "sigma", null, null, "sigma-web", null, "sigma-api");
        KeycloakProperties derivada = new KeycloakProperties(
                null, null,
                "https://kc.sigma/realms/sigma/protocol/openid-connect/token",
                null, "sigma-web", null, "sigma-api");

        assertEquals("https://kc.sigma", explicita.resolvedBaseUrl());
        assertEquals("https://kc.sigma", derivada.resolvedBaseUrl());
    }

    private static PropertySource<?> load(String resource) throws IOException {
        List<PropertySource<?>> sources = new YamlPropertySourceLoader()
                .load(resource, new ClassPathResource(resource));
        return sources.getFirst();
    }
}
