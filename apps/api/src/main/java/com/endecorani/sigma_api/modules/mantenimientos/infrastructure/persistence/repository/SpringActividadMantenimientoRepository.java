package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ActividadMantenimientoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringActividadMantenimientoRepository
        extends BaseJpaRepository<
        ActividadMantenimientoEntity,
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
            select actividad
            from ActividadMantenimientoEntity actividad
            where lower(actividad.codigo) like lower(concat('%', :query, '%'))
               or lower(actividad.nombre) like lower(concat('%', :query, '%'))
            """)
    Page<ActividadMantenimientoEntity> search(
            @Param("query") String query,
            Pageable pageable
    );

}
