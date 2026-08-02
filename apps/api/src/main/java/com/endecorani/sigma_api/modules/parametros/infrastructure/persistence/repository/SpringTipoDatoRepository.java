package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.TipoDatoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringTipoDatoRepository
        extends BaseJpaRepository<
        TipoDatoEntity,
        UUID
        > {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    @Query("""
            select tipoDato
            from TipoDatoEntity tipoDato
            where lower(tipoDato.codigo) like lower(concat('%', :query, '%'))
               or lower(tipoDato.nombre) like lower(concat('%', :query, '%'))
            """)
    Page<TipoDatoEntity> search(
            @Param("query") String query,
            Pageable pageable
    );
}
