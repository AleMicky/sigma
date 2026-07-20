package com.endecorani.sigma_api.config.security;

import com.endecorani.sigma_api.shared.application.response.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

// Este manejador responde cuando el usuario está autenticado, pero no tiene el rol requerido.
@Component
@RequiredArgsConstructor
public class RestAccessDeniedHandler
        implements AccessDeniedHandler {

    private final JsonMapper jsonMapper;

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            @NonNull AccessDeniedException accessDeniedException
    ) throws IOException {

        ApiErrorResponse errorResponse =
                ApiErrorResponse.of(
                        HttpStatus.FORBIDDEN.value(),
                        HttpStatus.FORBIDDEN.getReasonPhrase(),
                        "ACCESS_DENIED",
                        "No tiene permisos para acceder a este recurso",
                        request.getRequestURI()
                );

        response.setStatus(
                HttpStatus.FORBIDDEN.value()
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
