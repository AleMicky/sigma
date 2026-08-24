package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.OrdenTrabajoAdjuntoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.OrdenTrabajoAdjuntoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.OrdenTrabajoAdjuntoService;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping(
        ApiConstants.API_V1
                + "/ordenes-trabajo"
                + "/{ordenTrabajoId}/adjuntos"
)
@RequiredArgsConstructor
@Tag(
        name = "Adjuntos de Órdenes de Trabajo",
        description = "Administración de adjuntos de órdenes de trabajo"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class OrdenTrabajoAdjuntoController {

    private final OrdenTrabajoAdjuntoService service;

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(
            summary = "Registrar un adjunto con su archivo en una orden de trabajo"
    )
    public ResponseEntity<ApiResponse<OrdenTrabajoAdjuntoResponse>> createWithFile(
            @PathVariable UUID ordenTrabajoId,
            @RequestPart("file") MultipartFile file,
            @RequestPart(
                    value = "data",
                    required = false
            ) OrdenTrabajoAdjuntoRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Registro creado correctamente",
                                service.createWithFile(ordenTrabajoId, request, file)
                        )
                );
    }

    @PostMapping(
            value = "/{id}/archivo",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(
            summary = "Reemplazar el archivo de un adjunto existente"
    )
    public ResponseEntity<ApiResponse<OrdenTrabajoAdjuntoResponse>> replaceFile(
            @PathVariable UUID id,
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Archivo actualizado correctamente",
                        service.replaceFile(id, file)
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un adjunto por ID")
    public ResponseEntity<ApiResponse<OrdenTrabajoAdjuntoResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @GetMapping
    @Operation(summary = "Listar adjuntos de una orden de trabajo")
    public ResponseEntity<ApiResponse<PageResponse<OrdenTrabajoAdjuntoResponse>>> findByOrdenTrabajoId(
            @PathVariable UUID ordenTrabajoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        service.findByOrdenTrabajoId(ordenTrabajoId, pageRequest)
                )
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un adjunto de una orden de trabajo")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro eliminado correctamente"
                )
        );
    }
}
