package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request.ConductorLicenciaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.response.ConductorLicenciaResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.ConductorLicenciaService;
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
@RequestMapping(ApiConstants.API_V1 + "/conductor-licencias")
@RequiredArgsConstructor
@Tag(
        name = "Licencias de Conductor",
        description = "Administración, control de vigencia e historial de licencias de conducir con adjuntos"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ConductorLicenciaController {

    private final ConductorLicenciaService service;

    @GetMapping("/conductor/{conductorId}")
    @Operation(summary = "Listar todas las licencias e historial de un conductor")
    public ResponseEntity<ApiResponse<List<ConductorLicenciaResponse>>> findByConductorId(
            @PathVariable UUID conductorId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByConductorId(conductorId))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una licencia de conducir por ID")
    public ResponseEntity<ApiResponse<ConductorLicenciaResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @PostMapping(value = "/conductor/{conductorId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Registrar una licencia para un conductor con archivo adjunto opcional")
    public ResponseEntity<ApiResponse<ConductorLicenciaResponse>> createWithFile(
            @PathVariable UUID conductorId,
            @RequestPart("data") @Valid ConductorLicenciaRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Licencia de conducir registrada correctamente",
                        service.create(conductorId, request, file)
                ));
    }

    @PostMapping(value = "/conductor/{conductorId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Registrar una licencia para un conductor en formato JSON")
    public ResponseEntity<ApiResponse<ConductorLicenciaResponse>> createJson(
            @PathVariable UUID conductorId,
            @Valid @RequestBody ConductorLicenciaRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Licencia de conducir registrada correctamente",
                        service.create(conductorId, request, null)
                ));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Actualizar una licencia de conducir con archivo adjunto opcional")
    public ResponseEntity<ApiResponse<ConductorLicenciaResponse>> updateWithFile(
            @PathVariable UUID id,
            @RequestPart("data") @Valid ConductorLicenciaRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Licencia de conducir actualizada correctamente",
                        service.update(id, request, file)
                )
        );
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Actualizar una licencia de conducir en formato JSON")
    public ResponseEntity<ApiResponse<ConductorLicenciaResponse>> updateJson(
            @PathVariable UUID id,
            @Valid @RequestBody ConductorLicenciaRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Licencia de conducir actualizada correctamente",
                        service.update(id, request, null)
                )
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una licencia de conducir")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Licencia de conducir eliminada correctamente")
        );
    }
}
