package com.endecorani.sigma_api.modules.workflow.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.workflow.infrastructure.persistence.entity.WorkflowEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface WorkflowJpaRepository extends JpaRepository<WorkflowEntity, UUID> {

    Optional<WorkflowEntity> findByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    @Query("""
            SELECT w
            FROM WorkflowEntity w
            WHERE
                LOWER(w.codigo) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(w.nombre) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(w.modulo) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(w.processDefinitionKey) LIKE LOWER(CONCAT('%', :query, '%'))
            """)
    Page<WorkflowEntity> search(
            @Param("query") String query,
            Pageable pageable
    );
}