package com.endecorani.sigma_api.config.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final KeycloakJwtAuthenticationConverter keycloakJwtAuthenticationConverter;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize ->
                        authorize
                                .requestMatchers(
                                        "/swagger-ui.html",
                                        "/swagger-ui/**",
                                        "/v3/api-docs/**"
                                )
                                .permitAll()
                                .requestMatchers(
                                        "/actuator/health"
                                )
                                .permitAll()
                                .requestMatchers(
                                        "/api/v1/admin/**"
                                )
                                .hasRole("ADMIN")
                                .requestMatchers(
                                        "/api/v1/**"
                                )
                                .authenticated()
                                .anyRequest()
                                .denyAll()
                )
                .exceptionHandling(exception ->
                        exception
                                .authenticationEntryPoint(authenticationEntryPoint)
                                .accessDeniedHandler(accessDeniedHandler)
                )
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                        jwt.jwtAuthenticationConverter(
                                                keycloakJwtAuthenticationConverter
                                        ))
                                .authenticationEntryPoint(authenticationEntryPoint)
                                .accessDeniedHandler(accessDeniedHandler)
                );

        return http.build();
    }
}
