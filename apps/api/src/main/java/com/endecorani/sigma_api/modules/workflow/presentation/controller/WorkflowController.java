package com.endecorani.sigma_api.modules.workflow.presentation.controller;

import com.endecorani.sigma_api.modules.workflow.application.dto.request.WorkflowRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowResponse;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowConfigService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/workflows")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowConfigService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkflowResponse create(
            @Valid @RequestBody WorkflowRequest request
    ) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public WorkflowResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody WorkflowRequest request
    ) {
        return service.update(id, request);
    }

    @GetMapping("/{id}")
    public WorkflowResponse findById(
            @PathVariable UUID id
    ) {
        return service.findById(id);
    }

    @GetMapping("/codigo/{codigo}")
    public WorkflowResponse findByCodigo(
            @PathVariable String codigo
    ) {
        return service.findByCodigo(codigo);
    }

    @GetMapping
    public PageResponse<WorkflowResponse> findAll(
            @RequestParam(required = false) String query,
            PageRequestDto pageRequest
    ) {
        return service.findAll(
                query,
                pageRequest
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
    }
}