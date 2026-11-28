package com.endecorani.sigma_api.modules.cuestionarios.domain.repository;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoAsignacionCuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioAsignacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface CuestionarioAsignacionRepository {

    CuestionarioAsignacion save(CuestionarioAsignacion asignacion);

    Optional<CuestionarioAsignacion> findById(UUID id);

    Optional<CuestionarioAsignacion> findByCuestionarioIdAndEntidadTipoAndEntidadIdAndEvaluadorEmpleadoId(
            UUID cuestionarioId,
            String entidadTipo,
            UUID entidadId,
            UUID evaluadorEmpleadoId
    );

    Page<CuestionarioAsignacion> findByEvaluadorWithFilters(
            UUID evaluadorEmpleadoId,
            EstadoAsignacionCuestionario estado,
            String entidadTipo,
            Pageable pageable
    );

    List<CuestionarioAsignacion> findByEntidadTipoAndEntidadId(String entidadTipo, UUID entidadId);

    List<CuestionarioAsignacion> findByEntidadTipoAndEntidadIdAndEvaluadorEmpleadoId(
            String entidadTipo,
            UUID entidadId,
            UUID evaluadorEmpleadoId
    );

    List<CuestionarioAsignacion> findByEvaluadorEmpleadoIdAndEntidadTipoAndEntidadIdIn(
            UUID evaluadorEmpleadoId,
            String entidadTipo,
            Collection<UUID> entidadIds
    );

    boolean existsByCuestionarioId(UUID cuestionarioId);

    boolean existsByCuestionarioIdAndEstado(UUID cuestionarioId, EstadoAsignacionCuestionario estado);

    long countByCuestionarioIdAndEstado(UUID cuestionarioId, EstadoAsignacionCuestionario estado);

    Map<UUID, Long> countByCuestionarioIdsAndEstado(Collection<UUID> cuestionarioIds, EstadoAsignacionCuestionario estado);

    boolean existsByEvaluadorEmpleadoIdAndEntidadTipoAndEstadoAndObligatorioTrue(
            UUID evaluadorEmpleadoId,
            String entidadTipo,
            EstadoAsignacionCuestionario estado
    );

    List<CuestionarioAsignacion> findForReporteResumen(
            UUID cuestionarioId,
            UUID evaluadoId,
            Instant fechaDesde,
            Instant fechaHastaExclusivo
    );

    Page<CuestionarioAsignacion> findRespuestasForReporte(
            UUID cuestionarioId,
            UUID evaluadoId,
            Instant fechaDesde,
            Instant fechaHastaExclusivo,
            Pageable pageable
    );
}
