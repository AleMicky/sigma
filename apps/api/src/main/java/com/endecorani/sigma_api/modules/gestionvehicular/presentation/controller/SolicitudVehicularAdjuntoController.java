package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.SolicitudVehicularAdjuntoRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularAdjuntoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.SolicitudVehicularAdjuntoService;
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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/solicitudes-vehiculares/{solicitudVehicularId}/adjuntos")
@RequiredArgsConstructor
@Tag(
        name = "Adjuntos de Solicitud Vehicular",
        description = "Administración y subida de archivos adjuntos para solicitudes vehiculares"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class SolicitudVehicularAdjuntoController {

    private final SolicitudVehicularAdjuntoService service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Registrar un archivo adjunto en una solicitud vehicular")
    public ResponseEntity<ApiResponse<SolicitudVehicularAdjuntoResponse>> createWithFile(
            @PathVariable UUID solicitudVehicularId,
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "data", required = false) SolicitudVehicularAdjuntoRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Archivo adjunto subido correctamente",
                        service.createWithFile(solicitudVehicularId, request, file)
                ));
    }

    @PostMapping(value = "/multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir múltiples archivos adjuntos en una solicitud vehicular")
    public ResponseEntity<ApiResponse<List<SolicitudVehicularAdjuntoResponse>>> uploadMultipleFiles(
            @PathVariable UUID solicitudVehicularId,
            @RequestPart("files") List<MultipartFile> files
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Archivos adjuntos subidos correctamente",
                        service.uploadMultipleFiles(solicitudVehicularId, files)
                ));
    }

    @PostMapping(value = "/{id}/archivo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Reemplazar el archivo de un adjunto existente")
    public ResponseEntity<ApiResponse<SolicitudVehicularAdjuntoResponse>> replaceFile(
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
    public ResponseEntity<ApiResponse<SolicitudVehicularAdjuntoResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @GetMapping
    @Operation(summary = "Listar adjuntos de una solicitud vehicular con paginación")
    public ResponseEntity<ApiResponse<PageResponse<SolicitudVehicularAdjuntoResponse>>> findBySolicitudVehicularId(
            @PathVariable UUID solicitudVehicularId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findBySolicitudVehicularId(solicitudVehicularId, pageRequest))
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un archivo adjunto")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Archivo adjunto eliminado correctamente")
        );
    }
}
