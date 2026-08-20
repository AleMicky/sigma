package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.specification;

import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.CategoriaInsumoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringCategoriaInsumoRepository
        extends BaseJpaRepository<
        CategoriaInsumoEntity,
        UUID
        > {

    boolean existsByTipoInsumoIdAndCodigoIgnoreCase(
            UUID tipoInsumoId,
            String codigo
    );

    boolean existsByTipoInsumoIdAndCodigoIgnoreCaseAndIdNot(
            UUID tipoInsumoId,
            String codigo,
            UUID id
    );

    Page<CategoriaInsumoEntity> findByTipoInsumoId(
            UUID tipoInsumoId,
            Pageable pageable
    );

    @Query("""
            select categoriaInsumo
            from CategoriaInsumoEntity categoriaInsumo
            where lower(categoriaInsumo.codigo) like lower(concat('%', :query, '%'))
               or lower(categoriaInsumo.nombre) like lower(concat('%', :query, '%'))
               or lower(categoriaInsumo.descripcion) like lower(concat('%', :query, '%'))
            """)
    Page<CategoriaInsumoEntity> search(
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select categoriaInsumo
            from CategoriaInsumoEntity categoriaInsumo
            where categoriaInsumo.tipoInsumo.id = :tipoInsumoId
              and (lower(categoriaInsumo.codigo) like lower(concat('%', :query, '%'))
               or lower(categoriaInsumo.nombre) like lower(concat('%', :query, '%'))
               or lower(categoriaInsumo.descripcion) like lower(concat('%', :query, '%')))
            """)
    Page<CategoriaInsumoEntity> searchByTipoInsumoId(
            @Param("tipoInsumoId") UUID tipoInsumoId,
            @Param("query") String query,
            Pageable pageable
    );
}
