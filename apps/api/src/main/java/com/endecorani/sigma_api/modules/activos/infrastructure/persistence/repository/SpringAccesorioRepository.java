package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.AccesorioEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringAccesorioRepository
        extends JpaRepository<AccesorioEntity, UUID> {

    Page<AccesorioEntity> findByTipoActivoId(
            UUID tipoActivoId,
            Pageable pageable
    );

    @Query("""
            select accesorio
            from AccesorioEntity accesorio
            where accesorio.tipoActivoId = :tipoActivoId
              and (
                   lower(accesorio.codigo) like lower(concat('%', :query, '%'))
                   or lower(accesorio.nombre) like lower(concat('%', :query, '%'))
              )
            """)
    Page<AccesorioEntity> searchByTipoActivoId(
            @Param("tipoActivoId") UUID tipoActivoId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select accesorio
            from AccesorioEntity accesorio
            where lower(accesorio.codigo) like lower(concat('%', :query, '%'))
               or lower(accesorio.nombre) like lower(concat('%', :query, '%'))
            """)
    Page<AccesorioEntity> search(
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
}
