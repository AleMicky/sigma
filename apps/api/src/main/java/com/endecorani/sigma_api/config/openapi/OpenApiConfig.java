package com.endecorani.sigma_api.config.openapi;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.Scopes;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(OpenApiConfig.OpenApiProperties.class)
public class OpenApiConfig {

	public static final String SECURITY_SCHEME_NAME = "keycloak";

	@Bean
	public OpenAPI sigmaOpenApi(OpenApiProperties properties) {
		return new OpenAPI()
				.info(new Info()
						.title(properties.title())
						.description(properties.description())
						.version(properties.version())
						.contact(new Contact()
								.name("Endecorani")
								.email("dev@endecorani.com")))
				.components(new Components()
						.addSecuritySchemes(SECURITY_SCHEME_NAME, keycloakSecurityScheme(properties)))
				.addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME));
	}

	private SecurityScheme keycloakSecurityScheme(OpenApiProperties properties) {
		OAuthFlow authorizationCodeFlow = new OAuthFlow()
				.authorizationUrl(properties.keycloak().authorizationUrl())
				.tokenUrl(properties.keycloak().tokenUrl())
				.scopes(new Scopes()
						.addString("openid", "OpenID Connect")
						.addString("profile", "Información del perfil")
						.addString("email", "Correo electrónico"));

		return new SecurityScheme()
				.type(SecurityScheme.Type.OAUTH2)
				.description("Autenticación OAuth2 con Keycloak")
				.flows(new OAuthFlows().authorizationCode(authorizationCodeFlow));
	}

	@ConfigurationProperties(prefix = "app.openapi")
	public record OpenApiProperties(
			String title,
			String description,
			String version,
			Keycloak keycloak
	) {
		public record Keycloak(
				String authorizationUrl,
				String tokenUrl
		) {
		}
	}
}
