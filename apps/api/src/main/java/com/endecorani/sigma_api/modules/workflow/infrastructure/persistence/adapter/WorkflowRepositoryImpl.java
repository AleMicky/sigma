package com.endecorani.sigma_api.modules.workflow.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.workflow.domain.model.Workflow;
import com.endecorani.sigma_api.modules.workflow.domain.repository.WorkflowRepository;
import com.endecorani.sigma_api.modules.workflow.infrastructure.persistence.entity.WorkflowEntity;
import com.endecorani.sigma_api.modules.workflow.infrastructure.persistence.repository.WorkflowJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class WorkflowRepositoryImpl implements WorkflowRepository {

    private final WorkflowJpaRepository jpaRepository;

    @Override
    public Workflow save(Workflow workflow) {

        WorkflowEntity entity;

        if (workflow.getId() == null) {
            entity = new WorkflowEntity();
        } else {
            entity = jpaRepository
                    .findById(workflow.getId())
                    .orElseGet(WorkflowEntity::new);

            entity.setId(workflow.getId());
        }

        entity.setCodigo(workflow.getCodigo());
        entity.setNombre(workflow.getNombre());
        entity.setDescripcion(workflow.getDescripcion());
        entity.setModulo(workflow.getModulo());
        entity.setProcessDefinitionKey(workflow.getProcessDefinitionKey());

        return toDomain(
                jpaRepository.save(entity)
        );
    }

    @Override
    public Optional<Workflow> findById(UUID id) {
        return jpaRepository
                .findById(id)
                .map(this::toDomain);
    }

    @Override
    public Optional<Workflow> findByCodigoIgnoreCase(
            String codigo
    ) {
        return jpaRepository
                .findByCodigoIgnoreCase(codigo)
                .map(this::toDomain);
    }

    @Override
    public Page<Workflow> findAll(Pageable pageable) {
        return jpaRepository
                .findAll(pageable)
                .map(this::toDomain);
    }

    @Override
    public Page<Workflow> search(
            String query,
            Pageable pageable
    ) {
        return jpaRepository
                .search(query, pageable)
                .map(this::toDomain);
    }

    @Override
    public boolean existsByCodigoIgnoreCase(String codigo) {
        return jpaRepository
                .existsByCodigoIgnoreCase(codigo);
    }

    @Override
    public boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    ) {
        return jpaRepository
                .existsByCodigoIgnoreCaseAndIdNot(
                        codigo,
                        id
                );
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }

    private Workflow toDomain(WorkflowEntity entity) {
        return Workflow.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .modulo(entity.getModulo())
                .processDefinitionKey(
                        entity.getProcessDefinitionKey()
                )
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}