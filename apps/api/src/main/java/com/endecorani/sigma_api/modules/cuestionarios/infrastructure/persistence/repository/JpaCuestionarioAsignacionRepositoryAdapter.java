package com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoAsignacionCuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioAsignacion;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioAsignacionRepository;
import com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.entity.CuestionarioAsignacionEntity;
import com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.mapper.CuestionarioPersistenceMapper;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class JpaCuestionarioAsignacionRepositoryAdapter implements CuestionarioAsignacionRepository {

    private final SpringCuestionarioAsignacionRepository springRepository;
    private final CuestionarioPersistenceMapper mapper;

    @Override
    public CuestionarioAsignacion save(CuestionarioAsignacion asignacion) {
        return mapper.toDomain(springRepository.save(mapper.toEntity(asignacion)));
    }

    @Override
    public Optional<CuestionarioAsignacion> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<CuestionarioAsignacion> findByCuestionarioIdAndEntidadTipoAndEntidadIdAndEvaluadorEmpleadoId(
            UUID cuestionarioId,
            String entidadTipo,
            UUID entidadId,
            UUID evaluadorEmpleadoId
    ) {
        return springRepository.findByCuestionarioIdAndEntidadTipoAndEntidadIdAndEvaluadorEmpleadoId(
                cuestionarioId, entidadTipo, entidadId, evaluadorEmpleadoId
        ).map(mapper::toDomain);
    }

    @Override
    public Page<CuestionarioAsignacion> findByEvaluadorWithFilters(
            UUID evaluadorEmpleadoId,
            EstadoAsignacionCuestionario estado,
            String entidadTipo,
            Pageable pageable
    ) {
        Specification<CuestionarioAsignacionEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("evaluadorEmpleadoId"), evaluadorEmpleadoId));
            if (estado != null) {
                predicates.add(cb.equal(root.get("estado"), estado));
            }
            if (entidadTipo != null && !entidadTipo.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("entidadTipo")), entidadTipo.trim().toUpperCase(Locale.ROOT)));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        return springRepository.findAll(spec, pageable).map(mapper::toDomain);
    }

    @Override
    public List<CuestionarioAsignacion> findByEntidadTipoAndEntidadId(String entidadTipo, UUID entidadId) {
        return springRepository.findByEntidadTipoAndEntidadIdOrderByFechaHabilitacionDesc(entidadTipo, entidadId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<CuestionarioAsignacion> findByEntidadTipoAndEntidadIdAndEvaluadorEmpleadoId(
            String entidadTipo,
            UUID entidadId,
            UUID evaluadorEmpleadoId
    ) {
        return springRepository
                .findByEntidadTipoAndEntidadIdAndEvaluadorEmpleadoIdOrderByFechaHabilitacionDesc(
                        entidadTipo, entidadId, evaluadorEmpleadoId
                )
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<CuestionarioAsignacion> findByEvaluadorEmpleadoIdAndEntidadTipoAndEntidadIdIn(
            UUID evaluadorEmpleadoId,
            String entidadTipo,
            Collection<UUID> entidadIds
    ) {
        if (entidadIds == null || entidadIds.isEmpty()) {
            return List.of();
        }
        return springRepository
                .findByEvaluadorEmpleadoIdAndEntidadTipoAndEntidadIdIn(evaluadorEmpleadoId, entidadTipo, entidadIds)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public boolean existsByCuestionarioId(UUID cuestionarioId) {
        return springRepository.existsByCuestionarioId(cuestionarioId);
    }

    @Override
    public boolean existsByCuestionarioIdAndEstado(UUID cuestionarioId, EstadoAsignacionCuestionario estado) {
        return springRepository.existsByCuestionarioIdAndEstado(cuestionarioId, estado);
    }

    @Override
    public long countByCuestionarioIdAndEstado(UUID cuestionarioId, EstadoAsignacionCuestionario estado) {
        return springRepository.countByCuestionarioIdAndEstado(cuestionarioId, estado);
    }

    @Override
    public Map<UUID, Long> countByCuestionarioIdsAndEstado(
            Collection<UUID> cuestionarioIds,
            EstadoAsignacionCuestionario estado
    ) {
        if (cuestionarioIds == null || cuestionarioIds.isEmpty()) {
            return Map.of();
        }
        Map<UUID, Long> result = new HashMap<>();
        for (Object[] row : springRepository.countGroupedByCuestionarioIdsAndEstado(cuestionarioIds, estado)) {
            result.put((UUID) row[0], ((Number) row[1]).longValue());
        }
        return result;
    }

    @Override
    public boolean existsByEvaluadorEmpleadoIdAndEntidadTipoAndEstadoAndObligatorioTrue(
            UUID evaluadorEmpleadoId,
            String entidadTipo,
            EstadoAsignacionCuestionario estado
    ) {
        return springRepository.existsByEvaluadorEmpleadoIdAndEntidadTipoAndEstadoAndObligatorioTrue(
                evaluadorEmpleadoId, entidadTipo, estado
        );
    }

    @Override
    public List<CuestionarioAsignacion> findForReporteResumen(
            UUID cuestionarioId,
            UUID evaluadoId,
            Instant fechaDesde,
            Instant fechaHastaExclusivo
    ) {
        Specification<CuestionarioAsignacionEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("cuestionarioId"), cuestionarioId));
            if (evaluadoId != null) {
                predicates.add(cb.equal(root.get("evaluadoId"), evaluadoId));
            }
            Expression<Instant> fechaRef = cb.coalesce(root.get("fechaRespuesta"), root.get("fechaHabilitacion"));
            if (fechaDesde != null) {
                predicates.add(cb.greaterThanOrEqualTo(fechaRef, fechaDesde));
            }
            if (fechaHastaExclusivo != null) {
                predicates.add(cb.lessThan(fechaRef, fechaHastaExclusivo));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        return springRepository.findAll(spec).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Page<CuestionarioAsignacion> findRespuestasForReporte(
            UUID cuestionarioId,
            UUID evaluadoId,
            Instant fechaDesde,
            Instant fechaHastaExclusivo,
            Pageable pageable
    ) {
        Specification<CuestionarioAsignacionEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("cuestionarioId"), cuestionarioId));
            predicates.add(cb.equal(root.get("estado"), EstadoAsignacionCuestionario.RESPONDIDO));
            if (evaluadoId != null) {
                predicates.add(cb.equal(root.get("evaluadoId"), evaluadoId));
            }
            if (fechaDesde != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("fechaRespuesta"), fechaDesde));
            }
            if (fechaHastaExclusivo != null) {
                predicates.add(cb.lessThan(root.get("fechaRespuesta"), fechaHastaExclusivo));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        return springRepository.findAll(spec, pageable).map(mapper::toDomain);
    }
}
