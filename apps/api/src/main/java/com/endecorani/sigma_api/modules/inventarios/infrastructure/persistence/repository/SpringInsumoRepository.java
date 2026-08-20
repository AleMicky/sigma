package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.specification;

import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.InsumoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringInsumoRepository
        extends BaseJpaRepository<
        InsumoEntity,
        UUID
        > {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    @Query("""
            select insumo
            from InsumoEntity insumo
            where lower(insumo.codigo) like lower(concat('%', :query, '%'))
               or lower(insumo.nombre) like lower(concat('%', :query, '%'))
               or lower(insumo.descripcion) like lower(concat('%', :query, '%'))
               or lower(insumo.marca) like lower(concat('%', :query, '%'))
            """)
    Page<InsumoEntity> search(
            @Param("query") String query,
            Pageable pageable
    );
}
