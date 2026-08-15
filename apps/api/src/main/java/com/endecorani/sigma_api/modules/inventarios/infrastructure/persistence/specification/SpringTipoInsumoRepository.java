package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.specification;

import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.TipoInsumoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringTipoInsumoRepository
        extends BaseJpaRepository<
        TipoInsumoEntity,
        UUID
        > {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    @Query("""
            select tipoInsumo
            from TipoInsumoEntity tipoInsumo
            where lower(tipoInsumo.codigo) like lower(concat('%', :query, '%'))
               or lower(tipoInsumo.nombre) like lower(concat('%', :query, '%'))
               or lower(tipoInsumo.descripcion) like lower(concat('%', :query, '%'))
            """)
    Page<TipoInsumoEntity> search(
            @Param("query") String query,
            Pageable pageable
    );
}
