package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringActivoAtributoValorRepository
        extends BaseJpaRepository<ActivoAtributoValorEntity, UUID> {

    Page<ActivoAtributoValorEntity> findByActivoId(
            UUID activoId,
            Pageable pageable
    );

    java.util.List<ActivoAtributoValorEntity> findByActivoId(UUID activoId);

    /**
     * REQ-BIZ-004: se ejecuta y se vacía la sesión antes de insertar el nuevo
     * conjunto para no chocar con el índice único (activo_id, atributo_id).
     */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from ActivoAtributoValorEntity valor where valor.activoId = :activoId")
    void deleteAllByActivoId(@Param("activoId") UUID activoId);

    java.util.List<ActivoAtributoValorEntity> findByActivoIdIn(java.util.Collection<UUID> activoIds);

    boolean existsByActivoIdAndActivoAtributoId(
            UUID activoId,
            UUID activoAtributoId
    );

    boolean existsByActivoIdAndActivoAtributoIdAndIdNot(
            UUID activoId,
            UUID activoAtributoId,
            UUID id
    );
}
