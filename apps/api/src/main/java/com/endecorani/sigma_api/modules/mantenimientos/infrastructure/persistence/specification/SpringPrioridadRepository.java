package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.specification;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PrioridadEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringPrioridadRepository
        extends BaseJpaRepository<
        PrioridadEntity,
        UUID
        > {

    boolean existsByCodigoIgnoreCase(
            String codigo
    );

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    @Query("""
            select prioridad
            from PrioridadEntity prioridad
            where lower(prioridad.codigo) like lower(concat('%', :query, '%'))
               or lower(prioridad.nombre) like lower(concat('%', :query, '%'))
            """)
    Page<PrioridadEntity> search(
            @Param("query") String query,
            Pageable pageable
    );

}