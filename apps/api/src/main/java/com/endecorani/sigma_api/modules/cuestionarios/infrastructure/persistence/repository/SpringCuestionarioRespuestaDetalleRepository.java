package com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.entity.CuestionarioRespuestaDetalleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface SpringCuestionarioRespuestaDetalleRepository extends JpaRepository<CuestionarioRespuestaDetalleEntity, UUID> {

    List<CuestionarioRespuestaDetalleEntity> findByAsignacionId(UUID asignacionId);

    List<CuestionarioRespuestaDetalleEntity> findByAsignacionIdIn(Collection<UUID> asignacionIds);

    @Query("""
            SELECT CASE WHEN COUNT(r.id) > 0 THEN true ELSE false END
            FROM CuestionarioRespuestaDetalleEntity r
            JOIN CuestionarioPreguntaEntity p ON p.id = r.preguntaId
            WHERE p.cuestionarioId = :cuestionarioId
            """)
    boolean existsByCuestionarioId(@Param("cuestionarioId") UUID cuestionarioId);
}
