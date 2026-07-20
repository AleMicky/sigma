package com.endecorani.sigma_api.config.openapi;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

	private static final String BASIC_AUTH = "basicAuth";

	@Bean
	public OpenAPI sigmaOpenApi() {
		return new OpenAPI()
				.info(new Info()
						.title("Sigma API")
						.description("API documentation for Sigma")
						.version("v1")
						.contact(new Contact()
								.name("Endecorani")
								.email("dev@endecorani.com")))
				.components(new Components()
						.addSecuritySchemes(BASIC_AUTH, new SecurityScheme()
								.type(SecurityScheme.Type.HTTP)
								.scheme("basic")))
				.addSecurityItem(new SecurityRequirement().addList(BASIC_AUTH));
	}
}
