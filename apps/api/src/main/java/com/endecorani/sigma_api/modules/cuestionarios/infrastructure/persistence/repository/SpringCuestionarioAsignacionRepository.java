package com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoAsignacionCuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.entity.CuestionarioAsignacionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringCuestionarioAsignacionRepository
        extends JpaRepository<CuestionarioAsignacionEntity, UUID>, JpaSpecificationExecutor<CuestionarioAsignacionEntity> {

    Optional<CuestionarioAsignacionEntity> findByCuestionarioIdAndEntidadTipoAndEntidadIdAndEvaluadorEmpleadoId(
            UUID cuestionarioId,
            String entidadTipo,
            UUID entidadId,
            UUID evaluadorEmpleadoId
    );

    List<CuestionarioAsignacionEntity> findByEntidadTipoAndEntidadIdOrderByFechaHabilitacionDesc(
            String entidadTipo,
            UUID entidadId
    );

    List<CuestionarioAsignacionEntity> findByEntidadTipoAndEntidadIdAndEvaluadorEmpleadoIdOrderByFechaHabilitacionDesc(
            String entidadTipo,
            UUID entidadId,
            UUID evaluadorEmpleadoId
    );

    List<CuestionarioAsignacionEntity> findByEvaluadorEmpleadoIdAndEntidadTipoAndEntidadIdIn(
            UUID evaluadorEmpleadoId,
            String entidadTipo,
            Collection<UUID> entidadIds
    );

    boolean existsByCuestionarioId(UUID cuestionarioId);

    boolean existsByCuestionarioIdAndEstado(UUID cuestionarioId, EstadoAsignacionCuestionario estado);

    long countByCuestionarioIdAndEstado(UUID cuestionarioId, EstadoAsignacionCuestionario estado);

    @Query("""
            SELECT a.cuestionarioId, COUNT(a.id)
            FROM CuestionarioAsignacionEntity a
            WHERE a.cuestionarioId IN :ids AND a.estado = :estado
            GROUP BY a.cuestionarioId
            """)
    List<Object[]> countGroupedByCuestionarioIdsAndEstado(
            @Param("ids") Collection<UUID> ids,
            @Param("estado") EstadoAsignacionCuestionario estado
    );

    boolean existsByEvaluadorEmpleadoIdAndEntidadTipoAndEstadoAndObligatorioTrue(
            UUID evaluadorEmpleadoId,
            String entidadTipo,
            EstadoAsignacionCuestionario estado
    );
}
