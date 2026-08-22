package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.ResponsabilidadEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringResponsabilidadRepository
        extends BaseJpaRepository<
        ResponsabilidadEntity,
        UUID
        > {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    @Query("""
            select responsabilidad
            from ResponsabilidadEntity responsabilidad
            where lower(responsabilidad.codigo) like lower(concat('%', :query, '%'))
               or lower(responsabilidad.nombre) like lower(concat('%', :query, '%'))
            """)
    Page<ResponsabilidadEntity> search(
            @Param("query") String query,
            Pageable pageable
    );
}
