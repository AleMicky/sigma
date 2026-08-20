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
import org.springframework.web.bind.annotation.RestController;

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

    @PostMapping
    @Operation(
            summary =
                    "Registrar un adjunto en una solicitud de mantenimiento"
    )
    public ResponseEntity<
            ApiResponse<
                    SolicitudMantenimientoAdjuntoResponse
                    >
            > create(
            @PathVariable UUID solicitudMantenimientoId,
            @Valid @RequestBody
            SolicitudMantenimientoAdjuntoRequest request
    ) {
        SolicitudMantenimientoAdjuntoRequest alignedRequest =
                new SolicitudMantenimientoAdjuntoRequest(
                        solicitudMantenimientoId,
                        request.nombreArchivo(),
                        request.tipoContenido(),
                        request.size(),
                        request.url(),
                        request.descripcion()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Registro creado correctamente",
                                service.create(alignedRequest)
                        )
                );
    }

    @PutMapping("/{id}")
    @Operation(
            summary =
                    "Actualizar un adjunto de una solicitud de mantenimiento"
    )
    public ResponseEntity<
            ApiResponse<
                    SolicitudMantenimientoAdjuntoResponse
                    >
            > update(
            @PathVariable UUID solicitudMantenimientoId,
            @PathVariable UUID id,
            @Valid @RequestBody
            SolicitudMantenimientoAdjuntoRequest request
    ) {
        SolicitudMantenimientoAdjuntoRequest alignedRequest =
                new SolicitudMantenimientoAdjuntoRequest(
                        solicitudMantenimientoId,
                        request.nombreArchivo(),
                        request.tipoContenido(),
                        request.size(),
                        request.url(),
                        request.descripcion()
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro actualizado correctamente",
                        service.update(id, alignedRequest)
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(
            summary =
                    "Obtener un adjunto por id"
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
