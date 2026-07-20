package com.endecorani.sigma_api.config.security;

import com.endecorani.sigma_api.shared.application.response.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

// Este manejador responderá cuando el usuario no envíe un token válido.
@Component
@RequiredArgsConstructor
public class RestAuthenticationEntryPoint
        implements AuthenticationEntryPoint {

    private final JsonMapper jsonMapper;

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            @NonNull AuthenticationException authException
    ) throws IOException {

        ApiErrorResponse errorResponse =
                ApiErrorResponse.of(
                        HttpStatus.UNAUTHORIZED.value(),
                        HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                        "UNAUTHORIZED",
                        "Debe autenticarse para acceder a este recurso",
                        request.getRequestURI()
                );

        response.setStatus(
                HttpStatus.UNAUTHORIZED.value()
        );

        response.setCharacterEncoding(
                StandardCharsets.UTF_8.name()
        );

        response.setContentType(
                MediaType.APPLICATION_JSON_VALUE
        );

        jsonMapper.writeValue(
                response.getOutputStream(),
                errorResponse
        );
    }
}
