package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.activos.application.dto.request.AccesorioRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.AccesorioResponse;
import com.endecorani.sigma_api.modules.activos.application.service.AccesorioService;
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
@RequestMapping(ApiConstants.API_V1 + "/accesorios")
@RequiredArgsConstructor
@Tag(
        name = "Accesorios",
        description = "Administración de accesorios"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class AccesorioController {

    private final AccesorioService accesorioService;

    @PostMapping
    @Operation(summary = "Registrar un accesorio")
    public ResponseEntity<ApiResponse<AccesorioResponse>> create(
            @Valid @RequestBody AccesorioRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Registro creado correctamente",
                                accesorioService.create(request)
                        )
                );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un accesorio")
    public ResponseEntity<ApiResponse<AccesorioResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody AccesorioRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro actualizado correctamente",
                        accesorioService.update(id, request)
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un accesorio por id")
    public ResponseEntity<ApiResponse<AccesorioResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        accesorioService.findById(id)
                )
        );
    }

    @GetMapping(params = "tipoActivoId")
    @Operation(summary = "Listar accesorios filtrados por tipo de activo")
    public ResponseEntity<ApiResponse<PageResponse<AccesorioResponse>>> findByTipoActivoId(
            @RequestParam UUID tipoActivoId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        accesorioService.findByTipoActivoId(
                                tipoActivoId,
                                q,
                                pageRequest
                        )
                )
        );
    }

    @GetMapping
    @Operation(summary = "Listar accesorios")
    public ResponseEntity<ApiResponse<PageResponse<AccesorioResponse>>> findAll(
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        accesorioService.findAll(q, pageRequest)
                )
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un accesorio")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        accesorioService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro eliminado correctamente"
                )
        );
    }
}
