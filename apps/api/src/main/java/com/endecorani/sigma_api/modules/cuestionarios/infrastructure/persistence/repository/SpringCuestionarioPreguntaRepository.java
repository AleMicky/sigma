package com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.entity.CuestionarioPreguntaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface SpringCuestionarioPreguntaRepository extends JpaRepository<CuestionarioPreguntaEntity, UUID> {

    List<CuestionarioPreguntaEntity> findByCuestionarioIdOrderByOrdenAsc(UUID cuestionarioId);

    List<CuestionarioPreguntaEntity> findByCuestionarioIdAndActivoTrueOrderByOrdenAsc(UUID cuestionarioId);

    long countByCuestionarioIdAndActivoTrue(UUID cuestionarioId);

    @Query("""
            SELECT p.cuestionarioId, COUNT(p.id)
            FROM CuestionarioPreguntaEntity p
            WHERE p.cuestionarioId IN :ids AND p.activo = true
            GROUP BY p.cuestionarioId
            """)
    List<Object[]> countActiveGroupedByCuestionarioIds(@Param("ids") Collection<UUID> ids);

    void deleteByCuestionarioId(UUID cuestionarioId);
}
