package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.request.ChecklistMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.request.ChecklistMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.response.ChecklistMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.ChecklistMantenimientoService;
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
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping({
        ApiConstants.API_V1 + "/checklists-mantenimiento",
        ApiConstants.API_V1 + "/checklist-mantenimiento"
})
@RequiredArgsConstructor
@Tag(
        name = "Checklists de Mantenimiento",
        description = "Administración de listas de verificación de actividades de mantenimiento"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ChecklistMantenimientoController {

    private final ChecklistMantenimientoService service;

    @GetMapping
    @Operation(summary = "Listar checklists de mantenimiento con paginación y búsqueda opcional")
    public ResponseEntity<ApiResponse<PageResponse<ChecklistMantenimientoResponse>>> listar(
            @RequestParam(required = false) String search,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(search, pageRequest))
        );
    }

    @GetMapping(params = "actividadMantenimientoId")
    @Operation(summary = "Listar checklists por actividad de mantenimiento")
    public ResponseEntity<ApiResponse<PageResponse<ChecklistMantenimientoResponse>>> findByActividadMantenimientoId(
            @RequestParam UUID actividadMantenimientoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByActividadMantenimientoId(actividadMantenimientoId, pageRequest))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un checklist de mantenimiento por ID")
    public ResponseEntity<ApiResponse<ChecklistMantenimientoResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @GetMapping("/codigo/{codigo}")
    @Operation(summary = "Obtener un checklist de mantenimiento por su código")
    public ResponseEntity<ApiResponse<ChecklistMantenimientoResponse>> findByCodigo(
            @PathVariable String codigo
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByCodigo(codigo))
        );
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo checklist de mantenimiento")
    public ResponseEntity<ApiResponse<ChecklistMantenimientoResponse>> create(
            @Valid @RequestBody ChecklistMantenimientoRequest request
    ) {
        ChecklistMantenimientoResponse response = service.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Checklist de mantenimiento creado correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un checklist de mantenimiento")
    public ResponseEntity<ApiResponse<ChecklistMantenimientoResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ChecklistMantenimientoUpdate request
    ) {
        ChecklistMantenimientoResponse response = service.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Checklist de mantenimiento actualizado correctamente", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un checklist de mantenimiento")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Checklist de mantenimiento eliminado correctamente")
        );
    }
}
