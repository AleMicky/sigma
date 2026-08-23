package com.endecorani.sigma_api.modules.workflow.domain.repository;
import com.endecorani.sigma_api.modules.workflow.domain.model.Workflow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface WorkflowRepository {

    Workflow save(Workflow workflow);

    Optional<Workflow> findById(UUID id);

    Optional<Workflow> findByCodigoIgnoreCase(String codigo);

    Page<Workflow> findAll(Pageable pageable);

    Page<Workflow> search(
            String query,
            Pageable pageable
    );

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    void deleteById(UUID id);
}