package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringActivoRepository
        extends BaseJpaRepository<ActivoEntity, UUID> {

    Page<ActivoEntity> findByTipoActivoId(UUID tipoActivoId, Pageable pageable);

    @Query("""
            select activo
            from ActivoEntity activo
            where activo.tipoActivoId = :tipoActivoId
              and (
                   lower(activo.codigo) like lower(concat('%', :query, '%'))
                   or lower(activo.nombre) like lower(concat('%', :query, '%'))
              )
            """)
    Page<ActivoEntity> searchByTipoActivoId(
            @Param("tipoActivoId") UUID tipoActivoId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select activo
            from ActivoEntity activo
            where lower(activo.codigo) like lower(concat('%', :query, '%'))
               or lower(activo.nombre) like lower(concat('%', :query, '%'))
            """)
    Page<ActivoEntity> search(
            @Param("query") String query,
            Pageable pageable
    );

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);
}
