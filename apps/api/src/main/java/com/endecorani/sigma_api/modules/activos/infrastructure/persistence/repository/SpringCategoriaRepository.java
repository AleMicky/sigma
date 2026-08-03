package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.CategoriaEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringCategoriaRepository
        extends BaseJpaRepository<
        CategoriaEntity,
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
            select categoria
            from CategoriaEntity categoria
            where lower(categoria.codigo) like lower(concat('%', :query, '%'))
               or lower(categoria.nombre) like lower(concat('%', :query, '%'))
            """)
    Page<CategoriaEntity> search(
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select max(categoria.orden)
            from CategoriaEntity categoria
            """)
    Integer findMaxOrden();

}
