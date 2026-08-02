package com.endecorani.sigma_api.config.keycloak;

import com.endecorani.sigma_api.modules.auth.application.dto.KeycloakTokenResponse;
import com.endecorani.sigma_api.shared.domain.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.StringJoiner;

@Slf4j
@Component
@RequiredArgsConstructor
public class KeycloakTokenClient {

    private static final String GRANT_TYPE = "grant_type";
    private static final String CLIENT_ID = "client_id";
    private static final String CLIENT_SECRET = "client_secret";
    private static final String USERNAME = "username";
    private static final String PASSWORD = "password";
    private static final String REFRESH_TOKEN = "refresh_token";
    private static final String SCOPE = "scope";
    private static final String OPENID_SCOPE = "openid profile email";

    private final KeycloakProperties properties;
    private final JsonMapper jsonMapper;
    private final RestClient keycloakRestClient;

    public KeycloakTokenResponse passwordGrant(String username, String password) {
        MultiValueMap<String, String> form = baseForm("password");
        form.add(USERNAME, username);
        form.add(PASSWORD, password);
        form.add(SCOPE, OPENID_SCOPE);
        return exchange(form);
    }

    public KeycloakTokenResponse refreshGrant(String refreshToken) {
        MultiValueMap<String, String> form = baseForm("refresh_token");
        form.add(REFRESH_TOKEN, refreshToken);
        return exchange(form);
    }

    public void logout(String refreshToken) {
        MultiValueMap<String, String> form = baseForm(null);
        form.add(REFRESH_TOKEN, refreshToken);
        postForm(properties.resolvedLogoutUrl(), form, false);
    }

    private MultiValueMap<String, String> baseForm(String grantType) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        if (grantType != null) {
            form.add(GRANT_TYPE, grantType);
        }
        form.add(CLIENT_ID, properties.clientId());
        if (properties.clientSecret() != null && !properties.clientSecret().isBlank()) {
            form.add(CLIENT_SECRET, properties.clientSecret());
        }
        return form;
    }

    private KeycloakTokenResponse exchange(MultiValueMap<String, String> form) {
        String body = postForm(properties.tokenUrl(), form, true);
        KeycloakTokenResponse response = parseTokenResponse(body);
        if (response.accessToken() == null || response.accessToken().isBlank()) {
            throw new UnauthorizedException("Keycloak no devolvió un access token válido");
        }
        return response;
    }

    private String postForm(
            String url,
            MultiValueMap<String, String> form,
            boolean expectBody
    ) {
        String encodedBody = encodeForm(form);
        try {
            String body = keycloakRestClient
                    .post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(encodedBody)
                    .retrieve()
                    .body(String.class);

            return expectBody ? body : null;
        } catch (RestClientResponseException exception) {
            String detail = parseKeycloakError(exception.getResponseBodyAsString());
            log.warn(
                    "Keycloak rechazó la solicitud (url={}, clientId={}, status={}): {}",
                    url,
                    properties.clientId(),
                    exception.getStatusCode().value(),
                    detail
            );
            throw new UnauthorizedException(detail);
        } catch (UnauthorizedException exception) {
            throw exception;
        } catch (ResourceAccessException exception) {
            log.error(
                    "Timeout o red al llamar a Keycloak (url={}): {}",
                    url,
                    exception.getMessage()
            );
            throw new UnauthorizedException(
                    "Keycloak no respondió a tiempo (" + url
                            + "). Revisa red/firewall o que el servidor Keycloak esté arriba"
            );
        } catch (Exception exception) {
            log.error(
                    "Error de red o configuración al llamar a Keycloak (url={})",
                    url,
                    exception
            );
            throw new UnauthorizedException(
                    "No se pudo conectar con Keycloak. Verifica KEYCLOAK_TOKEN_URL y la red"
            );
        }
    }

    private static String encodeForm(MultiValueMap<String, String> form) {
        StringJoiner joiner = new StringJoiner("&");
        form.forEach((key, values) -> {
            if (values == null) {
                return;
            }
            for (String value : values) {
                if (value == null) {
                    continue;
                }
                joiner.add(
                        URLEncoder.encode(key, StandardCharsets.UTF_8)
                                + "="
                                + URLEncoder.encode(value, StandardCharsets.UTF_8)
                );
            }
        });
        return joiner.toString();
    }

    private KeycloakTokenResponse parseTokenResponse(String body) {
        if (body == null || body.isBlank()) {
            throw new UnauthorizedException("Keycloak no devolvió un access token válido");
        }

        JsonNode node = jsonMapper.readTree(body);
        return new KeycloakTokenResponse(
                textOrNull(node, "access_token"),
                textOrNull(node, "refresh_token"),
                longOrNull(node, "expires_in"),
                longOrNull(node, "refresh_expires_in"),
                textOrNull(node, "token_type"),
                textOrNull(node, "scope")
        );
    }

    private String parseKeycloakError(String body) {
        if (body == null || body.isBlank()) {
            return "Keycloak rechazó la autenticación sin detalle";
        }

        try {
            JsonNode node = jsonMapper.readTree(body);
            String error = textOrEmpty(node, "error");
            String description = textOrEmpty(node, "error_description");

            return switch (error) {
                case "invalid_client", "unauthorized_client" ->
                        "Client Keycloak inválido (" + properties.clientId()
                                + "). Verifica KEYCLOAK_CLIENT_ID y KEYCLOAK_CLIENT_SECRET"
                                + (description.isBlank() ? "" : ": " + description);
                case "invalid_grant" -> {
                    if (description.toLowerCase().contains("not fully set up")) {
                        yield "La cuenta en Keycloak no está completa (Required actions pendientes). "
                                + "En Users → admin.sigma quita UPDATE_PASSWORD / VERIFY_EMAIL / CONFIGURE_TOTP";
                    }
                    yield description.isBlank()
                            ? "Usuario o contraseña incorrectos, o Direct Access Grants deshabilitado"
                            : description;
                }
                case "invalid_scope" ->
                        "Scope inválido en la solicitud a Keycloak"
                                + (description.isBlank() ? "" : ": " + description);
                default -> description.isBlank()
                        ? (error.isBlank() ? "Credenciales inválidas o token rechazado por Keycloak" : error)
                        : error + ": " + description;
            };
        } catch (Exception ignored) {
            return "Credenciales inválidas o token rechazado por Keycloak";
        }
    }

    private static String textOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) {
            return null;
        }
        String text = value.asText("").trim();
        return text.isEmpty() ? null : text;
    }

    private static Long longOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull() || !value.isNumber()) {
            return null;
        }
        return value.asLong();
    }

    private static String textOrEmpty(JsonNode node, String field) {
        String value = textOrNull(node, field);
        return value == null ? "" : value;
    }
}
