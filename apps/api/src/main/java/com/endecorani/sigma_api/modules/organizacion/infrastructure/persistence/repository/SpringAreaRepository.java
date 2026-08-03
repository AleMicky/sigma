package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.AreaEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringAreaRepository
        extends BaseJpaRepository<
        AreaEntity,
        UUID
        > {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    @Query("""
            select area
            from AreaEntity area
            where lower(area.codigo) like lower(concat('%', :query, '%'))
               or lower(area.nombre) like lower(concat('%', :query, '%'))
            """)
    Page<AreaEntity> search(
            @Param("query") String query,
            Pageable pageable
    );
}