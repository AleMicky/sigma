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
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.List;

/**
 * Configura el JwtDecoder con timeouts generosos para tolerar latencia
 * en la conexión al servidor Keycloak (discovery OIDC + JWKS).
 *
 * <p>REQ-SEG-008: la audiencia permitida es exclusivamente {@code KEYCLOAK_AUDIENCE}
 * (default {@code sigma-api}); {@code account} nunca se acepta por defecto. El desfase
 * de reloj permitido se configura explícitamente con
 * {@code KEYCLOAK_JWT_CLOCK_SKEW_SECONDS} (default 60 s).</p>
 */
@Configuration
public class JwtDecoderConfig {

    private static final int TIMEOUT_MS = 15_000;

    static final Duration DEFAULT_CLOCK_SKEW = Duration.ofSeconds(60);

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    @Value("${app.keycloak.audience:sigma-api}")
    private String audience;

    @Value("${app.keycloak.jwt-clock-skew-seconds:60}")
    private long clockSkewSeconds;

    @Bean
    public JwtDecoder jwtDecoder() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(TIMEOUT_MS);
        factory.setReadTimeout(TIMEOUT_MS);

        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder
                .withIssuerLocation(issuerUri)
                .restOperations(new RestTemplate(factory))
                .build();

        jwtDecoder.setJwtValidator(buildTokenValidator(
                issuerUri, allowedAudiences(), configuredClockSkew()));
        return jwtDecoder;
    }

    /** Visible para tests: construye la política sin contactar a Keycloak. */
    OAuth2TokenValidator<Jwt> buildTokenValidator() {
        return buildTokenValidator(issuerUri, allowedAudiences(), configuredClockSkew());
    }

    static OAuth2TokenValidator<Jwt> buildTokenValidator(
            String issuer,
            List<String> audiences,
            Duration clockSkew
    ) {
        OAuth2TokenValidator<Jwt> timestampValidator =
                new JwtTimestampValidator(clockSkew == null ? DEFAULT_CLOCK_SKEW : clockSkew);
        OAuth2TokenValidator<Jwt> issuerValidator = new JwtIssuerValidator(issuer);
        OAuth2TokenValidator<Jwt> audienceValidator = token -> {
            List<String> tokenAud = token.getAudience();
            if (audiences != null && tokenAud != null
                    && tokenAud.stream().anyMatch(audiences::contains)) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(new OAuth2Error(
                    OAuth2ErrorCodes.INVALID_TOKEN,
                    "El token no contiene ninguna de las audiencias requeridas: " + audiences,
                    null
            ));
        };

        return new DelegatingOAuth2TokenValidator<>(
                timestampValidator, issuerValidator, audienceValidator);
    }

    private List<String> allowedAudiences() {
        return audience == null || audience.isBlank() ? List.of() : List.of(audience);
    }

    private Duration configuredClockSkew() {
        return clockSkewSeconds < 0 ? DEFAULT_CLOCK_SKEW : Duration.ofSeconds(clockSkewSeconds);
    }
}
