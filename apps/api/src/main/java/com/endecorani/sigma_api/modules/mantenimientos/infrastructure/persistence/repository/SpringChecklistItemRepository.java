package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.specification;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ChecklistItemEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringChecklistItemRepository
        extends JpaRepository<
        ChecklistItemEntity,
        UUID
        > {

    Page<ChecklistItemEntity> findByChecklistMantenimientoId(
            UUID checklistMantenimientoId,
            Pageable pageable
    );

    boolean existsByChecklistMantenimientoIdAndCodigoIgnoreCase(
            UUID checklistMantenimientoId,
            String codigo
    );

    boolean
    existsByChecklistMantenimientoIdAndCodigoIgnoreCaseAndIdNot(
            UUID checklistMantenimientoId,
            String codigo,
            UUID id
    );

    @Query("""
            select item
            from ChecklistItemEntity item
            where lower(item.codigo) like lower(concat('%', :query, '%'))
               or lower(item.nombre) like lower(concat('%', :query, '%'))
            """)
    Page<ChecklistItemEntity> search(
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select item
            from ChecklistItemEntity item
            where item.checklistMantenimientoId = :checklistMantenimientoId
              and (
                   lower(item.codigo) like lower(concat('%', :query, '%'))
                   or lower(item.nombre) like lower(concat('%', :query, '%'))
              )
            """)
    Page<ChecklistItemEntity> searchByChecklistMantenimientoId(
            @Param("checklistMantenimientoId")
            UUID checklistMantenimientoId,
            @Param("query") String query,
            Pageable pageable
    );
}
