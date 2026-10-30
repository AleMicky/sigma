package com.endecorani.sigma_api.modules.incidentes.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteinvolucrado.request.IncidenteInvolucradoRequest;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteinvolucrado.request.IncidenteInvolucradoUpdate;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteinvolucrado.response.IncidenteInvolucradoResponse;
import com.endecorani.sigma_api.modules.incidentes.application.service.IncidenteInvolucradoService;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({
        "/api/incidentes/{id}/involucrados",
        ApiConstants.API_V1 + "/incidentes/{id}/involucrados"
})
@RequiredArgsConstructor
@Tag(
        name = "Involucrados en Incidentes",
        description = "Administración de personas o personal involucrado en un incidente"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class IncidenteInvolucradoController {

    private final IncidenteInvolucradoService service;

    @PostMapping
    @Operation(summary = "Registrar involucrado")
    public ResponseEntity<ApiResponse<IncidenteInvolucradoResponse>> registrar(
            @PathVariable UUID id,
            @Valid @RequestBody IncidenteInvolucradoRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Involucrado registrado exitosamente",
                        service.registrar(id, request)
                ));
    }

    @GetMapping
    @Operation(summary = "Listar involucrados")
    public ResponseEntity<ApiResponse<List<IncidenteInvolucradoResponse>>> listar(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listarPorIncidente(id))
        );
    }

    @PutMapping("/{involucradoId}")
    @Operation(summary = "Actualizar involucrado")
    public ResponseEntity<ApiResponse<IncidenteInvolucradoResponse>> actualizar(
            @PathVariable UUID id,
            @PathVariable UUID involucradoId,
            @Valid @RequestBody IncidenteInvolucradoUpdate request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Involucrado actualizado exitosamente",
                        service.actualizar(id, involucradoId, request)
                )
        );
    }

    @DeleteMapping("/{involucradoId}")
    @Operation(summary = "Eliminar involucrado")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable UUID id,
            @PathVariable UUID involucradoId
    ) {
        service.eliminar(id, involucradoId);
        return ResponseEntity.ok(
                ApiResponse.success("Involucrado eliminado exitosamente", null)
        );
    }
}

