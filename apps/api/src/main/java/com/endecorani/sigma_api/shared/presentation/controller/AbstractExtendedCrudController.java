package com.endecorani.sigma_api.shared.presentation.controller;

import com.endecorani.sigma_api.shared.application.crud.ExtendedCrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.pagination.SearchPageRequestDto;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador base CRUD ampliado que soporta DTOs especializados e independientes
 * para la creación y la actualización de entidades.
 *
 * @param <CREATE_REQ> DTO de creación.
 * @param <UPDATE_REQ> DTO de actualización.
 * @param <RESPONSE>   DTO de respuesta.
 * @param <ID>         Tipo del identificador único de la entidad.
 */
public abstract class AbstractExtendedCrudController<
        CREATE_REQ,
        UPDATE_REQ,
        RESPONSE,
        ID
        > {

    protected abstract ExtendedCrudService<CREATE_REQ, UPDATE_REQ, RESPONSE, ID> service();

    protected String createdMessage() {
        return "Registro creado correctamente";
    }

    protected String updatedMessage() {
        return "Registro actualizado correctamente";
    }

    protected String deletedMessage() {
        return "Registro eliminado correctamente";
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo registro")
    public ResponseEntity<ApiResponse<RESPONSE>> create(
            @Valid @RequestBody CREATE_REQ request
    ) {
        RESPONSE response = service().create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                createdMessage(),
                                response
                        )
                );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un registro existente")
    public ResponseEntity<ApiResponse<RESPONSE>> update(
            @PathVariable ID id,
            @Valid @RequestBody UPDATE_REQ request
    ) {
        RESPONSE response = service().update(id, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        updatedMessage(),
                        response
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un registro por su ID")
    public ResponseEntity<ApiResponse<RESPONSE>> findById(
            @PathVariable ID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        service().findById(id)
                )
        );
    }

    @GetMapping
    @Operation(summary = "Listar registros con paginación y búsqueda opcional")
    public ResponseEntity<ApiResponse<PageResponse<RESPONSE>>> findAll(
            @Valid @ModelAttribute SearchPageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        listResponse(pageRequest)
                )
        );
    }

    public ResponseEntity<ApiResponse<PageResponse<RESPONSE>>> findAll(
            PageRequestDto pageRequest
    ) {
        return findAll(new SearchPageRequestDto(pageRequest, null));
    }

    /**
     * Hook personalizable para obtener la lista paginada.
     * Por defecto delega a service().findAll(...), pero las subclases pueden sobrescribirlo
     * para aplicar búsquedas por texto libre o filtros específicos.
     */
    protected PageResponse<RESPONSE> listResponse(SearchPageRequestDto pageRequest) {
        return service().findAll(pageRequest.toPageRequest());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un registro")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable ID id
    ) {
        service().delete(id);
        return ResponseEntity.ok(
                ApiResponse.success(
                        deletedMessage()
                )
        );
    }
}

