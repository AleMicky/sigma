package com.endecorani.sigma_api.config.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.util.AntPathMatcher;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    private final KeycloakJwtAuthenticationConverter keycloakJwtAuthenticationConverter;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
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
                                        HttpMethod.POST,
                                        "/api/v1/auth/login",
                                        "/api/v1/auth/refresh",
                                        "/api/v1/auth/logout"
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
                        oauth2
                                .bearerTokenResolver(publicAuthBearerTokenResolver())
                                .jwt(jwt ->
                                        jwt.jwtAuthenticationConverter(
                                                keycloakJwtAuthenticationConverter
                                        ))
                                .authenticationEntryPoint(authenticationEntryPoint)
                                .accessDeniedHandler(accessDeniedHandler)
                );

        return http.build();
    }

    /**
     * Evita validar JWT (y colgarse en JWKS) en login/refresh aunque Swagger envíe Authorize.
     */
    private static BearerTokenResolver publicAuthBearerTokenResolver() {
        DefaultBearerTokenResolver delegate = new DefaultBearerTokenResolver();
        return (HttpServletRequest request) -> {
            String path = request.getRequestURI();
            if (HttpMethod.POST.matches(request.getMethod())
                    && (PATH_MATCHER.match("/api/v1/auth/login", path)
                    || PATH_MATCHER.match("/api/v1/auth/refresh", path)
                    || PATH_MATCHER.match("/api/v1/auth/logout", path))) {
                return null;
            }
            return delegate.resolve(request);
        };
    }
}
