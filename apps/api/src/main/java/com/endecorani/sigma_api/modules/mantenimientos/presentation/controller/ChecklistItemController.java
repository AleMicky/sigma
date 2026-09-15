package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.request.ChecklistItemRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.request.ChecklistItemUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.response.ChecklistItemResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.ChecklistItemService;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({
        ApiConstants.API_V1 + "/checklist-items",
        ApiConstants.API_V1 + "/checklists-items"
})
@RequiredArgsConstructor
@Tag(
        name = "Ítems de Checklist",
        description = "Administración de ítems y campos de los checklists de mantenimiento"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ChecklistItemController {

    private final ChecklistItemService service;

    @GetMapping
    @Operation(summary = "Listar ítems de checklist con paginación")
    public ResponseEntity<ApiResponse<PageResponse<ChecklistItemResponse>>> findAll(
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findAll(pageRequest))
        );
    }

    @GetMapping(params = "checklistMantenimientoId")
    @Operation(summary = "Listar ítems de un checklist de mantenimiento")
    public ResponseEntity<ApiResponse<PageResponse<ChecklistItemResponse>>> findByChecklistMantenimientoId(
            @RequestParam UUID checklistMantenimientoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByChecklistMantenimientoId(checklistMantenimientoId, pageRequest))
        );
    }

    @GetMapping("/checklist/{checklistMantenimientoId}")
    @Operation(summary = "Listar todos los ítems ordenados de un checklist de mantenimiento")
    public ResponseEntity<ApiResponse<List<ChecklistItemResponse>>> findItemsByChecklist(
            @PathVariable UUID checklistMantenimientoId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByChecklistMantenimientoId(checklistMantenimientoId))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un ítem de checklist por ID")
    public ResponseEntity<ApiResponse<ChecklistItemResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo ítem de checklist")
    public ResponseEntity<ApiResponse<ChecklistItemResponse>> create(
            @Valid @RequestBody ChecklistItemRequest request
    ) {
        ChecklistItemResponse response = service.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ítem de checklist creado correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un ítem de checklist")
    public ResponseEntity<ApiResponse<ChecklistItemResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ChecklistItemUpdate request
    ) {
        ChecklistItemResponse response = service.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Ítem de checklist actualizado correctamente", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un ítem de checklist")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Ítem de checklist eliminado correctamente")
        );
    }
}
