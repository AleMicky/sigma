package com.endecorani.sigma_api.modules.organizacion.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.organizacion.application.dto.RegistroMigracionResponse;
import com.endecorani.sigma_api.modules.organizacion.application.service.RegistroMigracionService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/registros-migracion")
@RequiredArgsConstructor
@Tag(
        name = "Migración",
        description = "Logs de migración de datos desde sistemas externos (solo lectura)"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class RegistroMigracionController {

    private final RegistroMigracionService registroMigracionService;

    @GetMapping
    @Operation(summary = "Listar registros de migración con filtros opcionales")
    public ResponseEntity<ApiResponse<PageResponse<RegistroMigracionResponse>>> findAll(
            @Parameter(description = "Sistema de origen (filtro parcial, ignore-case)")
            @RequestParam(required = false)
            String sistemaOrigen,

            @Parameter(description = "Entidad migrada (filtro parcial, ignore-case)")
            @RequestParam(required = false)
            String entidad,

            @Parameter(description = "Estado de la migración (PENDIENTE, MIGRADO, ACTUALIZADO, OMITIDO, ERROR)")
            @RequestParam(required = false)
            String estado,

            @Parameter(description = "Fecha desde (inclusive), formato ISO 8601")
            @RequestParam(required = false)
            Instant fechaDesde,

            @Parameter(description = "Fecha hasta (exclusive), formato ISO 8601")
            @RequestParam(required = false)
            Instant fechaHasta,

            @Parameter(description = "Búsqueda libre sobre idOrigen y mensaje (ignore-case)")
            @RequestParam(required = false)
            String q,

            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        registroMigracionService.findAll(
                                sistemaOrigen,
                                entidad,
                                estado,
                                fechaDesde,
                                fechaHasta,
                                q,
                                pageRequest
                        )
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener el detalle de un registro de migración")
    public ResponseEntity<ApiResponse<RegistroMigracionResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        registroMigracionService.findById(id)
                )
        );
    }
}