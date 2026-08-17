package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.ChecklistItemRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.ChecklistItemResponse;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/checklist-items")
@RequiredArgsConstructor
@Tag(
        name = "Checklist Items",
        description = "Administración de items de checklists de mantenimiento"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class ChecklistItemController {

    private final ChecklistItemService service;

    @PostMapping
    @Operation(summary = "Registrar un item de checklist")
    public ResponseEntity<ApiResponse<ChecklistItemResponse>> create(
            @Valid @RequestBody ChecklistItemRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Registro creado correctamente",
                                service.create(request)
                        )
                );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un item de checklist")
    public ResponseEntity<ApiResponse<ChecklistItemResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ChecklistItemRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro actualizado correctamente",
                        service.update(id, request)
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un item de checklist por id")
    public ResponseEntity<ApiResponse<ChecklistItemResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @GetMapping(params = "checklistMantenimientoId")
    @Operation(summary = "Listar items por checklist de mantenimiento")
    public ResponseEntity<
            ApiResponse<PageResponse<ChecklistItemResponse>>
            > findByChecklistMantenimientoId(
            @RequestParam UUID checklistMantenimientoId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        service.findByChecklistMantenimientoId(
                                checklistMantenimientoId,
                                q,
                                pageRequest
                        )
                )
        );
    }

    @GetMapping
    @Operation(summary = "Listar todos los items de checklist")
    public ResponseEntity<
            ApiResponse<PageResponse<ChecklistItemResponse>>
            > findAll(
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        service.findAll(q, pageRequest)
                )
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un item de checklist")
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
