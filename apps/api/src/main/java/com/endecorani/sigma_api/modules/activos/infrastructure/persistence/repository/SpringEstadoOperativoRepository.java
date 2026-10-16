package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.EstadoOperativoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringEstadoOperativoRepository
        extends BaseJpaRepository<EstadoOperativoEntity, UUID> {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, UUID id);

    @Query("""
            SELECT e
            FROM EstadoOperativoEntity e
            WHERE LOWER(e.codigo) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(e.nombre) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(e.descripcion) LIKE LOWER(CONCAT('%', :query, '%'))
            """)
    Page<EstadoOperativoEntity> search(
            @Param("query") String query,
            Pageable pageable
    );
}
