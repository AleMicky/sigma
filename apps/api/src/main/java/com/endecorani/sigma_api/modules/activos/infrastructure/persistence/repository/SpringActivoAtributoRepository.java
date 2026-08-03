package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringActivoAtributoRepository
        extends BaseJpaRepository<
        ActivoAtributoEntity,
        UUID
        > {

    Page<ActivoAtributoEntity> findByTipoActivoId(
            UUID tipoActivoId,
            Pageable pageable
    );

    @Query("""
            select atributo
            from ActivoAtributoEntity atributo
            where atributo.tipoActivoId = :tipoActivoId
              and (
                   lower(atributo.codigo) like lower(concat('%', :query, '%'))
                   or lower(atributo.etiqueta) like lower(concat('%', :query, '%'))
              )
            """)
    Page<ActivoAtributoEntity> searchByTipoActivoId(
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

    @Query("""
            select max(atributo.orden)
            from ActivoAtributoEntity atributo
            where atributo.tipoActivoId = :tipoActivoId
            """)
    Integer findMaxOrdenByTipoActivoId(
            @Param("tipoActivoId") UUID tipoActivoId
    );

    boolean existsByTipoActivoIdAndOrden(
            UUID tipoActivoId,
            Integer orden
    );

    boolean existsByTipoActivoIdAndOrdenAndIdNot(
            UUID tipoActivoId,
            Integer orden,
            UUID id
    );
}
