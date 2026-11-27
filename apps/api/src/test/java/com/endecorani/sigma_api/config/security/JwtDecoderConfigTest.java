package com.endecorani.sigma_api.config.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** REQ-SEG-008: audiencia exclusiva de la API y política de clock-skew explícita. */
class JwtDecoderConfigTest {

    private static final String ISSUER = "http://keycloak.test/realms/sigma";

    @Test
    void audAccount_debeSerRechazado() {
        OAuth2TokenValidator<Jwt> validator = validator(Duration.ofSeconds(60));
        Jwt token = token(List.of("account"), Instant.now().minusSeconds(5), Instant.now().plusSeconds(300));

        assertTrue(validator.validate(token).hasErrors());
    }

    @Test
    void audSigmaApi_debeSerAceptado() {
        OAuth2TokenValidator<Jwt> validator = validator(Duration.ofSeconds(60));
        Jwt token = token(List.of("sigma-api"), Instant.now().minusSeconds(5), Instant.now().plusSeconds(300));

        assertFalse(validator.validate(token).hasErrors());
    }

    @Test
    void clockSkewConfigurado_debeAceptarNotBeforeLigeramenteEnElFuturo() {
        Instant notBefore = Instant.now().plusSeconds(30);
        Instant expiresAt = Instant.now().plusSeconds(600);
        Jwt token = token(List.of("sigma-api"), notBefore, expiresAt);

        assertFalse(validator(Duration.ofSeconds(60)).validate(token).hasErrors(),
                "Con 60 s de skew el nbf +30 s debe aceptarse");
        assertTrue(validator(Duration.ZERO).validate(token).hasErrors(),
                "Sin skew el mismo token debe rechazarse");
    }

    @Test
    void issuerDistinto_debeSerRechazado() {
        OAuth2TokenValidator<Jwt> validator = validator(Duration.ofSeconds(60));
        Jwt token = Jwt.withTokenValue("token")
                .header("alg", "none")
                .issuer("http://otro-keycloak/realms/sigma")
                .subject("kc-1")
                .audience(List.of("sigma-api"))
                .issuedAt(Instant.now().minusSeconds(5))
                .expiresAt(Instant.now().plusSeconds(300))
                .build();

        assertTrue(validator.validate(token).hasErrors());
    }

    @Test
    void sinAudienciasPermitidas_debeFallarCerrado() {
        OAuth2TokenValidator<Jwt> validator = JwtDecoderConfig.buildTokenValidator(
                ISSUER, List.of(), Duration.ofSeconds(60));
        Jwt token = token(List.of("sigma-api"), Instant.now().minusSeconds(5), Instant.now().plusSeconds(300));

        assertTrue(validator.validate(token).hasErrors());
    }

    private static OAuth2TokenValidator<Jwt> validator(Duration clockSkew) {
        return JwtDecoderConfig.buildTokenValidator(
                ISSUER, List.of("sigma-api"), clockSkew);
    }

    private static Jwt token(List<String> audiences, Instant notBefore, Instant expiresAt) {
        return Jwt.withTokenValue("token")
                .header("alg", "none")
                .issuer(ISSUER)
                .subject("kc-1")
                .audience(audiences)
                .issuedAt(notBefore)
                .notBefore(notBefore)
                .expiresAt(expiresAt)
                .build();
    }
}
