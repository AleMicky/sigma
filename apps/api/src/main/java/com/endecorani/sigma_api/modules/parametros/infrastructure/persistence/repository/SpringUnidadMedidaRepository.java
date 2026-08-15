package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.UnidadMedidaEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringUnidadMedidaRepository
        extends BaseJpaRepository<
        UnidadMedidaEntity,
        UUID
        > {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    @Query("""
            select unidadMedida
            from UnidadMedidaEntity unidadMedida
            where lower(unidadMedida.codigo) like lower(concat('%', :query, '%'))
               or lower(unidadMedida.nombre) like lower(concat('%', :query, '%'))
               or lower(unidadMedida.simbolo) like lower(concat('%', :query, '%'))
            """)
    Page<UnidadMedidaEntity> search(
            @Param("query") String query,
            Pageable pageable
    );
}
