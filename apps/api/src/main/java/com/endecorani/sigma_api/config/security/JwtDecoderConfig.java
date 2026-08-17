package com.endecorani.sigma_api.config.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.web.client.RestTemplate;

/**
 * Configura el JwtDecoder con timeouts generosos para tolerar latencia
 * en la conexión al servidor Keycloak (discovery OIDC + JWKS).
 *
 * <p>Spring Boot auto-configura un JwtDecoder basado en {@code issuer-uri}, pero usa
 * el RestTemplate por defecto (sin timeout explícito, que en algunos JDKs/SO resulta
 * en un timeout de sistema muy corto). Al declarar este @Bean tomamos el control del
 * timeout y evitamos el {@code SocketTimeoutException} cuando Keycloak responde lento.
 */
@Configuration
public class JwtDecoderConfig {

    /** Timeout de conexión TCP al servidor Keycloak (ms). */
    private static final int CONNECT_TIMEOUT_MS = 15_000;

    /** Timeout de lectura de la respuesta HTTP (ms). */
    private static final int READ_TIMEOUT_MS = 15_000;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    @Bean
    public JwtDecoder jwtDecoder() {
        // RestTemplate con timeouts configurados
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECT_TIMEOUT_MS);
        factory.setReadTimeout(READ_TIMEOUT_MS);

        RestTemplate restTemplate = new RestTemplate(factory);

        return NimbusJwtDecoder
                .withIssuerLocation(issuerUri)
                .restOperations(restTemplate)
                .build();
    }
}
