package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.SolicitudMantenimientoAdjuntoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.SolicitudMantenimientoAdjuntoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.SolicitudMantenimientoAdjuntoService;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping(
        ApiConstants.API_V1
                + "/solicitudes-mantenimiento"
                + "/{solicitudMantenimientoId}/adjuntos"
)
@RequiredArgsConstructor
@Tag(
        name = "Adjuntos de Solicitudes de Mantenimiento",
        description =
                "Administración de adjuntos de solicitudes de mantenimiento"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class SolicitudMantenimientoAdjuntoController {

    private final SolicitudMantenimientoAdjuntoService service;

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(
            summary =
                    "Registrar un adjunto con su archivo en una solicitud de mantenimiento"
    )
    public ResponseEntity<
            ApiResponse<
                    SolicitudMantenimientoAdjuntoResponse
                    >
            > createWithFile(
            @PathVariable UUID solicitudMantenimientoId,
            @RequestPart("file") MultipartFile file,
            @RequestPart(
                    value = "data",
                    required = false
            ) SolicitudMantenimientoAdjuntoRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Registro creado correctamente",
                                service.createWithFile(
                                        solicitudMantenimientoId,
                                        request,
                                        file
                                )
                        )
                );
    }

    @PostMapping(
            value = "/{id}/archivo",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(
            summary =
                    "Reemplazar el archivo de un adjunto existente"
    )
    public ResponseEntity<
            ApiResponse<
                    SolicitudMantenimientoAdjuntoResponse
                    >
            > replaceFile(
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
    @Operation(
            summary = "Obtener un adjunto por id"
    )
    public ResponseEntity<
            ApiResponse<
                    SolicitudMantenimientoAdjuntoResponse
                    >
            > findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @GetMapping
    @Operation(
            summary =
                    "Listar adjuntos de una solicitud de mantenimiento"
    )
    public ResponseEntity<
            ApiResponse<
                    PageResponse<
                            SolicitudMantenimientoAdjuntoResponse
                            >
                    >
            > findBySolicitudMantenimientoId(
            @PathVariable UUID solicitudMantenimientoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        service.findBySolicitudMantenimientoId(
                                solicitudMantenimientoId,
                                pageRequest
                        )
                )
        );
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary =
                    "Eliminar un adjunto de una solicitud de mantenimiento"
    )
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
