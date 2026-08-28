package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.activos.application.dto.request.ActivoAccesorioRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoAccesorioResponse;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoAccesorioService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/activo-accesorios")
@RequiredArgsConstructor
@Tag(
        name = "Activo Accesorios",
        description = "Administración de accesorios asignados a activos"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ActivoAccesorioController {

    private final ActivoAccesorioService activoAccesorioService;

    @PostMapping
    @Operation(summary = "Asignar un accesorio a un activo")
    public ResponseEntity<ApiResponse<ActivoAccesorioResponse>> create(
            @Valid @RequestBody ActivoAccesorioRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Registro creado correctamente",
                                activoAccesorioService.create(request)
                        )
                );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar la asignación de un accesorio a un activo")
    public ResponseEntity<ApiResponse<ActivoAccesorioResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ActivoAccesorioRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro actualizado correctamente",
                        activoAccesorioService.update(id, request)
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una asignación de accesorio por id")
    public ResponseEntity<ApiResponse<ActivoAccesorioResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        activoAccesorioService.findById(id)
                )
        );
    }

    @GetMapping(params = "activoId")
    @Operation(summary = "Listar accesorios de un activo")
    public ResponseEntity<ApiResponse<PageResponse<ActivoAccesorioResponse>>> findByActivoId(
            @RequestParam UUID activoId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        activoAccesorioService.findByActivoId(
                                activoId,
                                q,
                                pageRequest
                        )
                )
        );
    }

    @GetMapping(params = "accesorioId")
    @Operation(summary = "Listar activos que tienen un accesorio específico")
    public ResponseEntity<ApiResponse<PageResponse<ActivoAccesorioResponse>>> findByAccesorioId(
            @RequestParam UUID accesorioId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        activoAccesorioService.findByAccesorioId(
                                accesorioId,
                                pageRequest
                        )
                )
        );
    }

    @GetMapping
    @Operation(summary = "Listar todas las asignaciones de accesorios")
    public ResponseEntity<ApiResponse<PageResponse<ActivoAccesorioResponse>>> findAll(
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        activoAccesorioService.findAll(q, pageRequest)
                )
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar la asignación de un accesorio a un activo")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        activoAccesorioService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro eliminado correctamente"
                )
        );
    }
}
