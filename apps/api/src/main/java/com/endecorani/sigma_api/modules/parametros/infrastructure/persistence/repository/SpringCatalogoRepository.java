package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.CatalogoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringCatalogoRepository
        extends BaseJpaRepository<
        CatalogoEntity,
        UUID
        > {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    @Query("""
            select catalogo
            from CatalogoEntity catalogo
            where lower(catalogo.codigo) like lower(concat('%', :query, '%'))
               or lower(catalogo.nombre) like lower(concat('%', :query, '%'))
            """)
    Page<CatalogoEntity> search(
            @Param("query") String query,
            Pageable pageable
    );
}
