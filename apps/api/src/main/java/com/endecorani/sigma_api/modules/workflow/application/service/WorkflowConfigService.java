package com.endecorani.sigma_api.modules.workflow.application.service;

import com.endecorani.sigma_api.modules.workflow.application.dto.request.WorkflowRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowResponse;
import com.endecorani.sigma_api.modules.workflow.domain.model.Workflow;
import com.endecorani.sigma_api.modules.workflow.domain.repository.WorkflowRepository;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkflowConfigService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "modulo",
            "processDefinitionKey",
            "createdAt",
            "updatedAt"
    );

    private final WorkflowRepository repository;

    @Transactional
    public WorkflowResponse create(WorkflowRequest request) {

        String codigo = requireValue(request.codigo()).toUpperCase();

        if (repository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "WORKFLOW_ALREADY_EXISTS",
                    "Ya existe un workflow con el código '%s'"
                            .formatted(codigo)
            );
        }

        Workflow domain = Workflow.builder()
                .codigo(codigo)
                .nombre(requireValue(request.nombre()))
                .descripcion(StringUtils.normalize(request.descripcion()))
                .modulo(requireValue(request.modulo()).toUpperCase())
                .processDefinitionKey(
                        requireValue(request.processDefinitionKey())
                )
                .build();

        return toResponse(repository.save(domain));
    }

    @Transactional
    public WorkflowResponse update(
            UUID id,
            WorkflowRequest request
    ) {

        Workflow domain = findDomainById(id);
        String codigo = requireValue(request.codigo()).toUpperCase();
        if (repository.existsByCodigoIgnoreCaseAndIdNot(codigo, id)) {
            throw new ConflictException(
                    "WORKFLOW_ALREADY_EXISTS",
                    "Ya existe otro workflow con el código '%s'"
                            .formatted(codigo)
            );
        }

        domain.setCodigo(codigo);
        domain.setNombre(requireValue(request.nombre()));
        domain.setDescripcion(StringUtils.normalize(request.descripcion()));
        domain.setModulo(requireValue(request.modulo()).toUpperCase());
        domain.setProcessDefinitionKey(requireValue(request.processDefinitionKey()));
        return toResponse(repository.save(domain));
    }

    @Transactional(readOnly = true)
    public WorkflowResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public WorkflowResponse findByCodigo(String codigo) {
        return toResponse(findDomainByCodigo(codigo));
    }

    @Transactional(readOnly = true)
    public Workflow findDomainByCodigo(String codigo) {
        return repository
                .findByCodigoIgnoreCase(codigo)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Workflow",
                                codigo
                        )
                );
    }

    @Transactional(readOnly = true)
    public PageResponse<WorkflowResponse> findAll(
            String query,
            PageRequestDto pageRequest
    ) {

        String normalized = StringUtils.normalize(query);

        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        if (normalized == null) {
            return PageResponse.from(
                    repository.findAll(pageable),
                    this::toResponse
            );
        }

        return PageResponse.from(
                repository.search(normalized, pageable),
                this::toResponse
        );
    }

    @Transactional
    public void delete(UUID id) {
        findDomainById(id);
        repository.deleteById(id);
    }

    private Workflow findDomainById(UUID id) {
        return repository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Workflow",
                                id
                        )
                );
    }

    private String requireValue(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null) {
            throw new IllegalArgumentException(
                    "El valor es requerido"
            );
        }

        return normalized;
    }

    private WorkflowResponse toResponse(Workflow domain) {

        return new WorkflowResponse(
                domain.getId(),
                domain.getCodigo(),
                domain.getNombre(),
                domain.getDescripcion(),
                domain.getModulo(),
                domain.getProcessDefinitionKey(),
                AuditoriaMapper.from(domain)
        );
    }
}