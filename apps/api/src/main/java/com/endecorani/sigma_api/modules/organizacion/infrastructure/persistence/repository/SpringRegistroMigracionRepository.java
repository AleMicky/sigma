package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.organizacion.domain.enums.EstadoMigracion;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.RegistroMigracionEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface SpringRegistroMigracionRepository
        extends BaseJpaRepository<
        RegistroMigracionEntity,
        java.util.UUID
        > {

    @Query("""
            select r
            from RegistroMigracionEntity r
            where (:estado IS NULL OR r.estado = :estado)
              and (:sistemaOrigen IS NULL
                   or lower(r.sistemaOrigen) like lower(concat('%', :sistemaOrigen, '%')))
              and (:entidad IS NULL
                   or lower(r.entidad) like lower(concat('%', :entidad, '%')))
              and (:fechaDesde IS NULL OR r.fechaRegistro >= :fechaDesde)
              and (:fechaHasta IS NULL OR r.fechaRegistro < :fechaHasta)
              and (:query IS NULL
                   or lower(r.idOrigen) like lower(concat('%', :query, '%'))
                   or lower(coalesce(r.mensaje, '')) like lower(concat('%', :query, '%')))
            """)
    Page<RegistroMigracionEntity> findAllByFilter(
            @Param("estado") EstadoMigracion estado,
            @Param("sistemaOrigen") String sistemaOrigen,
            @Param("entidad") String entidad,
            @Param("fechaDesde") Instant fechaDesde,
            @Param("fechaHasta") Instant fechaHasta,
            @Param("query") String query,
            Pageable pageable
    );
}