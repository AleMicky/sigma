package com.endecorani.sigma_api.config.cors;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Configuration
@EnableConfigurationProperties(CorsProperties.class)
public class CorsConfig {

    private static final List<String> ALLOWED_METHODS = List.of(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"
    );

    private static final List<String> EXPOSED_HEADERS = List.of(
            "Content-Disposition",
            "Content-Type",
            "Authorization"
    );

    @Bean
    CorsConfigurationSource corsConfigurationSource(CorsProperties properties) {
        List<String> origins = properties == null || properties.allowedOrigins() == null
                ? List.of()
                : properties.allowedOrigins().stream()
                        .filter(Objects::nonNull)
                        .flatMap(value -> Arrays.stream(value.split(",")))
                        .map(String::trim)
                        .filter(origin -> !origin.isBlank())
                        .distinct()
                        .toList();

        CorsConfiguration configuration = new CorsConfiguration();
        if (origins.isEmpty()) {
            configuration.setAllowedOrigins(List.of());
            configuration.setAllowCredentials(false);
        } else if (origins.contains("*")) {
            configuration.setAllowedOrigins(List.of("*"));
            configuration.setAllowCredentials(false);
        } else if (origins.stream().anyMatch(origin -> origin.contains("*"))) {
            configuration.setAllowedOriginPatterns(origins);
            configuration.setAllowCredentials(true);
        } else {
            configuration.setAllowedOrigins(origins);
            configuration.setAllowCredentials(true);
        }
        configuration.setAllowedMethods(ALLOWED_METHODS);
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(EXPOSED_HEADERS);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
