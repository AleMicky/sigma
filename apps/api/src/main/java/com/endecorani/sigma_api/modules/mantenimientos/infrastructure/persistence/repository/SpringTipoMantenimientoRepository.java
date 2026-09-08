package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.TipoMantenimientoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface SpringTipoMantenimientoRepository extends BaseJpaRepository<TipoMantenimientoEntity, UUID> {

    Optional<TipoMantenimientoEntity> findByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    @Query("""
            select t
            from TipoMantenimientoEntity t
            where lower(t.codigo) like lower(concat('%', :query, '%'))
               or lower(t.nombre) like lower(concat('%', :query, '%'))
               or lower(t.descripcion) like lower(concat('%', :query, '%'))
            """)
    Page<TipoMantenimientoEntity> search(
            @Param("query") String query,
            Pageable pageable
    );
}