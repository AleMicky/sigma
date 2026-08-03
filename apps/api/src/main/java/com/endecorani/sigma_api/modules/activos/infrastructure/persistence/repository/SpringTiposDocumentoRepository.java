package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.TiposDocumentoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringTiposDocumentoRepository
        extends BaseJpaRepository<
        TiposDocumentoEntity,
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
            select tipoDocumento
            from TiposDocumentoEntity tipoDocumento
            where lower(tipoDocumento.codigo) like lower(concat('%', :query, '%'))
               or lower(tipoDocumento.nombre) like lower(concat('%', :query, '%'))
            """)
    Page<TiposDocumentoEntity> search(
            @Param("query") String query,
            Pageable pageable
    );

}