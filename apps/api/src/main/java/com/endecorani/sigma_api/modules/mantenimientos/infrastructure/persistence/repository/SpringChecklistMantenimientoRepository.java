package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ChecklistMantenimientoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringChecklistMantenimientoRepository
        extends JpaRepository<
        ChecklistMantenimientoEntity,
        UUID
        > {

    Page<ChecklistMantenimientoEntity>
    findByActividadMantenimientoId(
            UUID actividadMantenimientoId,
            Pageable pageable
    );

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    boolean existsByActividadMantenimientoIdAndCodigoIgnoreCase(
            UUID actividadMantenimientoId,
            String codigo
    );

    boolean
    existsByActividadMantenimientoIdAndCodigoIgnoreCaseAndIdNot(
            UUID actividadMantenimientoId,
            String codigo,
            UUID id
    );

    @Query("""
            select c
            from ChecklistMantenimientoEntity c
            where lower(c.codigo) like lower(concat('%', :query, '%'))
               or lower(c.nombre) like lower(concat('%', :query, '%'))
            """)
    Page<ChecklistMantenimientoEntity> search(
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select c
            from ChecklistMantenimientoEntity c
            where c.actividadMantenimientoId = :actividadMantenimientoId
              and (
                   lower(c.codigo) like lower(concat('%', :query, '%'))
                   or lower(c.nombre) like lower(concat('%', :query, '%'))
              )
            """)
    Page<ChecklistMantenimientoEntity> searchByActividadMantenimientoId(
            @Param("actividadMantenimientoId") UUID actividadMantenimientoId,
            @Param("query") String query,
            Pageable pageable
    );
}
