package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * REQ-MANT-030: validación de tamaño de página exclusiva del módulo de mantenimientos.
 *
 * <p>El clamp global de {@link PageRequestDto} se conserva para el resto de módulos
 * ({@code size=1000} responde 200 con 500). Los controllers de mantenimientos invocan
 * explícitamente este validador con el valor <em>crudo</em> del parámetro {@code size}
 * antes de enlazar el DTO, de modo que {@code size > 500} responde
 * {@code 400 INVALID_PAGE_SIZE} sin depender del valor ya recortado.</p>
 */
public final class MantenimientoPageSizeValidator {

    private MantenimientoPageSizeValidator() {
    }

    /**
     * @param sizeSolicitado valor original del parámetro {@code size}; {@code null} si no se envió.
     * @throws IllegalArgumentException con {@code INVALID_PAGE_SIZE} cuando excede el máximo del módulo.
     */
    public static void validar(Integer sizeSolicitado) {
        if (sizeSolicitado != null && sizeSolicitado > ApiConstants.MAX_PAGE_SIZE) {
            throw new IllegalArgumentException(PageRequestDto.INVALID_PAGE_SIZE_CODE);
        }
    }

    /**
     * Variante para los listados heredados de {@code AbstractExtendedCrudController},
     * cuyo DTO ya llegó recortado: lee el parámetro {@code size} original de la petición.
     */
    public static void validarTamanoDeLaPeticion() {
        RequestAttributes atributos = RequestContextHolder.getRequestAttributes();
        if (atributos instanceof ServletRequestAttributes servlet) {
            String raw = servlet.getRequest().getParameter("size");
            if (raw != null && !raw.isBlank()) {
                try {
                    validar(Integer.valueOf(raw.trim()));
                } catch (NumberFormatException ignorado) {
                    // El enlace del DTO ya reporta el formato inválido del parámetro.
                }
            }
        }
    }
}
