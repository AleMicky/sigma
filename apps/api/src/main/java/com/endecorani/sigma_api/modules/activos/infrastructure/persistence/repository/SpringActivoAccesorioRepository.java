package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAccesorioEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringActivoAccesorioRepository
        extends JpaRepository<ActivoAccesorioEntity, UUID> {

    Page<ActivoAccesorioEntity> findByActivoId(
            UUID activoId,
            Pageable pageable
    );

    Page<ActivoAccesorioEntity> findByAccesorioId(
            UUID accesorioId,
            Pageable pageable
    );

    @Query("""
            select aa
            from ActivoAccesorioEntity aa
            where lower(aa.numeroSerie) like lower(concat('%', :query, '%'))
               or lower(aa.observacion) like lower(concat('%', :query, '%'))
            """)
    Page<ActivoAccesorioEntity> search(
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select aa
            from ActivoAccesorioEntity aa
            where aa.activo.id = :activoId
              and (
                   lower(aa.numeroSerie) like lower(concat('%', :query, '%'))
                   or lower(aa.observacion) like lower(concat('%', :query, '%'))
              )
            """)
    Page<ActivoAccesorioEntity> searchByActivoId(
            @Param("activoId") UUID activoId,
            @Param("query") String query,
            Pageable pageable
    );

    boolean existsByActivoIdAndAccesorioId(UUID activoId, UUID accesorioId);

    boolean existsByActivoIdAndAccesorioIdAndIdNot(
            UUID activoId,
            UUID accesorioId,
            UUID id
    );
}
