package com.endecorani.sigma_api.modules.incidentes.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteevidencia.response.IncidenteEvidenciaResponse;
import com.endecorani.sigma_api.modules.incidentes.application.service.IncidenteEvidenciaService;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({
        "/api/incidentes/{id}/evidencias",
        ApiConstants.API_V1 + "/incidentes/{id}/evidencias"
})
@RequiredArgsConstructor
@Tag(
        name = "Evidencias de Incidentes",
        description = "Administración y carga de archivos probatorios y evidencias de incidentes"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class IncidenteEvidenciaController {

    private final IncidenteEvidenciaService service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir archivo de evidencia")
    public ResponseEntity<ApiResponse<IncidenteEvidenciaResponse>> subirEvidencia(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Evidencia subida exitosamente",
                        service.subirEvidencia(id, file)
                ));
    }

    @GetMapping
    @Operation(summary = "Listar evidencias")
    public ResponseEntity<ApiResponse<List<IncidenteEvidenciaResponse>>> listar(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listarPorIncidente(id))
        );
    }

    @GetMapping("/{evidenciaId}")
    @Operation(summary = "Obtener metadatos de evidencia")
    public ResponseEntity<ApiResponse<IncidenteEvidenciaResponse>> findById(
            @PathVariable UUID id,
            @PathVariable UUID evidenciaId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.obtenerPorId(id, evidenciaId))
        );
    }

    @DeleteMapping("/{evidenciaId}")
    @Operation(summary = "Eliminar evidencia")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable UUID id,
            @PathVariable UUID evidenciaId
    ) {
        service.eliminar(id, evidenciaId);
        return ResponseEntity.ok(
                ApiResponse.success("Evidencia eliminada exitosamente", null)
        );
    }
}

