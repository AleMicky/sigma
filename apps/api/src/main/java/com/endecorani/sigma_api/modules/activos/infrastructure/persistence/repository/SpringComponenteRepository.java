package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ComponenteEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringComponenteRepository
        extends BaseJpaRepository<
        ComponenteEntity,
        UUID
        > {

    Page<ComponenteEntity> findByTipoActivoId(
            UUID tipoActivoId,
            Pageable pageable
    );

    @Query("""
            select componente
            from ComponenteEntity componente
            where componente.tipoActivoId = :tipoActivoId
              and (
                   lower(componente.codigo) like lower(concat('%', :query, '%'))
                   or lower(componente.nombre) like lower(concat('%', :query, '%'))
              )
            """)
    Page<ComponenteEntity> searchByTipoActivoId(
            @Param("tipoActivoId") UUID tipoActivoId,
            @Param("query") String query,
            Pageable pageable
    );

    boolean existsByTipoActivoIdAndCodigoIgnoreCase(
            UUID tipoActivoId,
            String codigo
    );

    boolean existsByTipoActivoIdAndCodigoIgnoreCaseAndIdNot(
            UUID tipoActivoId,
            String codigo,
            UUID id
    );
}
