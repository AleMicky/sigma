package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.TipoInsumoAtributoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringTipoInsumoAtributoRepository
        extends BaseJpaRepository<
        TipoInsumoAtributoEntity,
        UUID
        > {

    Page<TipoInsumoAtributoEntity> findByTipoInsumoId(
            UUID tipoInsumoId,
            Pageable pageable
    );

    @Query("""
            select atributo
            from TipoInsumoAtributoEntity atributo
            where atributo.tipoInsumoId = :tipoInsumoId
              and (
                   lower(atributo.codigo) like lower(concat('%', :query, '%'))
                   or lower(atributo.nombre) like lower(concat('%', :query, '%'))
              )
            """)
    Page<TipoInsumoAtributoEntity> searchByTipoInsumoId(
            @Param("tipoInsumoId") UUID tipoInsumoId,
            @Param("query") String query,
            Pageable pageable
    );

    boolean existsByTipoInsumoIdAndCodigoIgnoreCase(
            UUID tipoInsumoId,
            String codigo
    );

    boolean existsByTipoInsumoIdAndCodigoIgnoreCaseAndIdNot(
            UUID tipoInsumoId,
            String codigo,
            UUID id
    );

    @Query("""
            select max(atributo.orden)
            from TipoInsumoAtributoEntity atributo
            where atributo.tipoInsumoId = :tipoInsumoId
            """)
    Integer findMaxOrdenByTipoInsumoId(
            @Param("tipoInsumoId") UUID tipoInsumoId
    );

    boolean existsByTipoInsumoIdAndOrden(
            UUID tipoInsumoId,
            Integer orden
    );

    boolean existsByTipoInsumoIdAndOrdenAndIdNot(
            UUID tipoInsumoId,
            Integer orden,
            UUID id
    );
}
