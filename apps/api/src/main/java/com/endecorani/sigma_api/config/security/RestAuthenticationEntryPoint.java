package com.endecorani.sigma_api.config.security;

import com.endecorani.sigma_api.shared.application.response.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
@Component
@RequiredArgsConstructor
public class RestAuthenticationEntryPoint
        implements AuthenticationEntryPoint {

    /** REQ-SEG-005: respuesta 401 estable; el motivo del decoder sólo se registra en el log. */
    private static final String UNAUTHORIZED_MESSAGE = "Debe autenticarse para acceder a este recurso";

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
                        UNAUTHORIZED_MESSAGE,
                        request.getRequestURI()
                );

        // El mensaje puede incluir audience, issuer o el JWT rechazado: diagnosticar en el
        // log, nunca repetirlo en el cuerpo de la respuesta.
        log.warn(
                "Acceso no autenticado a {} (detalle del decoder omitido en el cuerpo)",
                request.getRequestURI(),
                authException
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
