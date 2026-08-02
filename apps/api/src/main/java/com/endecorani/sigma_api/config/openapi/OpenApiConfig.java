package com.endecorani.sigma_api.config.openapi;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(OpenApiConfig.OpenApiProperties.class)
public class OpenApiConfig {

	public static final String SECURITY_SCHEME_NAME = "bearer-jwt";

	@Bean
	public OpenAPI sigmaOpenApi(OpenApiProperties properties) {
		return new OpenAPI()
				.info(new Info()
						.title(properties.title())
						.description(properties.description()
								+ " Autenticación: POST /api/v1/auth/login → copia data.accessToken → Authorize (Bearer).")
						.version(properties.version())
						.contact(new Contact()
								.name("Endecorani")
								.email("dev@endecorani.com")))
				.components(new Components()
						.addSecuritySchemes(SECURITY_SCHEME_NAME, bearerJwtScheme()))
				.addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME));
	}

	private SecurityScheme bearerJwtScheme() {
		return new SecurityScheme()
				.name(SECURITY_SCHEME_NAME)
				.type(SecurityScheme.Type.HTTP)
				.scheme("bearer")
				.bearerFormat("JWT")
				.description(
						"1) Ejecuta POST /api/v1/auth/login (sin Authorize). "
								+ "2) Copia data.accessToken de la respuesta. "
								+ "3) Pégalo aquí (solo el JWT, sin la palabra Bearer)."
				);
	}

	@ConfigurationProperties(prefix = "app.openapi")
	public record OpenApiProperties(
			String title,
			String description,
			String version
	) {
	}
}
