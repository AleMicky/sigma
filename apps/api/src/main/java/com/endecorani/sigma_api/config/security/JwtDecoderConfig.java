package com.endecorani.sigma_api.config.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * Configura el JwtDecoder con timeouts generosos para tolerar latencia
 * en la conexión al servidor Keycloak (discovery OIDC + JWKS).
 */
@Configuration
public class JwtDecoderConfig {

    private static final int TIMEOUT_MS = 15_000;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    @Value("${spring.security.oauth2.resourceserver.jwt.audiences:}")
    private List<String> audiences;

    @Bean
    public JwtDecoder jwtDecoder() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(TIMEOUT_MS);
        factory.setReadTimeout(TIMEOUT_MS);

        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder
                .withIssuerLocation(issuerUri)
                .restOperations(new RestTemplate(factory))
                .build();

        jwtDecoder.setJwtValidator(buildTokenValidator());
        return jwtDecoder;
    }

    private OAuth2TokenValidator<Jwt> buildTokenValidator() {
        OAuth2TokenValidator<Jwt> defaultValidator = JwtValidators.createDefaultWithIssuer(issuerUri);
        if (audiences == null || audiences.isEmpty()) {
            return defaultValidator;
        }

        OAuth2TokenValidator<Jwt> audienceValidator = token -> {
            List<String> tokenAud = token.getAudience();
            if (tokenAud != null && tokenAud.stream().anyMatch(audiences::contains)) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(new OAuth2Error(
                    OAuth2ErrorCodes.INVALID_TOKEN,
                    "El token no contiene ninguna de las audiencias requeridas: " + audiences,
                    null
            ));
        };

        return new DelegatingOAuth2TokenValidator<>(defaultValidator, audienceValidator);
    }
}
