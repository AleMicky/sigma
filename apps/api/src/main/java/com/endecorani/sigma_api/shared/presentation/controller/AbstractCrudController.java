package com.endecorani.sigma_api.shared.presentation.controller;

import com.endecorani.sigma_api.shared.application.crud.CrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

public abstract class AbstractCrudController<
        REQUEST,
        RESPONSE,
        ID
        > {

    protected abstract CrudService<REQUEST, RESPONSE, ID> service();

    @PostMapping
    public ResponseEntity<ApiResponse<RESPONSE>> create(
            @Valid @RequestBody REQUEST request
    ) {
        RESPONSE response = service().create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Registro creado correctamente",
                                response
                        )
                );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RESPONSE>> update(
            @PathVariable ID id,
            @Valid @RequestBody REQUEST request
    ) {
        RESPONSE response = service().update(id, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro actualizado correctamente",
                        response
                )
        );
    }

    @GetMapping("/{id}")
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
    public ResponseEntity<ApiResponse<PageResponse<RESPONSE>>> findAll(
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        service().findAll(pageRequest)
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable ID id
    ) {
        service().delete(id);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro eliminado correctamente"
                )
        );
    }
}
