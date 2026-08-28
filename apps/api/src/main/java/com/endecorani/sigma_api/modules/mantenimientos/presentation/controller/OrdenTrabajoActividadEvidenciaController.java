package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.OrdenTrabajoActividadEvidenciaResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.OrdenTrabajoActividadEvidenciaService;
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
                + "/ordenes-trabajo-actividades"
                + "/{ordenTrabajoActividadId}/evidencias"
)
@RequiredArgsConstructor
@Tag(
        name = "Evidencias de Actividades de Orden de Trabajo",
        description = "Administración de evidencias (archivos) de actividades de órdenes de trabajo"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class OrdenTrabajoActividadEvidenciaController {

    private final OrdenTrabajoActividadEvidenciaService service;

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(
            summary = "Subir una evidencia a una actividad de orden de trabajo"
    )
    public ResponseEntity<ApiResponse<OrdenTrabajoActividadEvidenciaResponse>> createWithFile(
            @PathVariable UUID ordenTrabajoActividadId,
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Registro creado correctamente",
                                service.createWithFile(ordenTrabajoActividadId, file)
                        )
                );
    }

    @PostMapping(
            value = "/{id}/archivo",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(
            summary = "Reemplazar el archivo de una evidencia existente"
    )
    public ResponseEntity<ApiResponse<OrdenTrabajoActividadEvidenciaResponse>> replaceFile(
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
    @Operation(summary = "Obtener una evidencia por ID")
    public ResponseEntity<ApiResponse<OrdenTrabajoActividadEvidenciaResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @GetMapping
    @Operation(summary = "Listar evidencias de una actividad de orden de trabajo")
    public ResponseEntity<ApiResponse<PageResponse<OrdenTrabajoActividadEvidenciaResponse>>> findByOrdenTrabajoActividadId(
            @PathVariable UUID ordenTrabajoActividadId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        service.findByOrdenTrabajoActividadId(ordenTrabajoActividadId, pageRequest)
                )
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una evidencia")
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
