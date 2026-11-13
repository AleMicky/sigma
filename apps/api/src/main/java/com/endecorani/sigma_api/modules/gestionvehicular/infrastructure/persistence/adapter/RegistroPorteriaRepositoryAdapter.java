package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoRegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.RegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.RegistroPorteriaRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.RegistroPorteriaActivoEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.RegistroPorteriaEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.RegistroPorteriaPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringRegistroPorteriaRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoEntity;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class RegistroPorteriaRepositoryAdapter implements RegistroPorteriaRepository {

    private final SpringRegistroPorteriaRepository springRepository;
    private final RegistroPorteriaPersistenceMapper mapper;

    @Override
    public RegistroPorteria save(RegistroPorteria registro) {
        RegistroPorteriaEntity entity = mapper.toEntity(registro);
        RegistroPorteriaEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<RegistroPorteria> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<RegistroPorteria> findAfuera(UUID areaId) {
        if (areaId == null) {
            return springRepository.findByEstadoOrderByFechaHoraSalidaDesc(EstadoRegistroPorteria.AFUERA)
                    .stream()
                    .map(mapper::toDomain)
                    .toList();
        }

        Specification<RegistroPorteriaEntity> spec = (root, query, cb) -> cb.and(
                cb.equal(root.get("estado"), EstadoRegistroPorteria.AFUERA),
                empleadoPerteneceAArea(root, query, cb, areaId)
        );

        return springRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "fechaHoraSalida"))
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Page<RegistroPorteria> findAll(
            String search,
            UUID empleadoId,
            UUID activoId,
            UUID areaId,
            EstadoRegistroPorteria estado,
            Instant fechaDesde,
            Instant fechaHasta,
            Pageable pageable
    ) {
        Specification<RegistroPorteriaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("numero")), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get("observacionSalida"), "")), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get("observacionLlegada"), "")), pattern)
                ));
            }
            if (empleadoId != null) {
                predicates.add(cb.equal(root.get("empleadoId"), empleadoId));
            }
            if (areaId != null) {
                predicates.add(empleadoPerteneceAArea(root, query, cb, areaId));
            }
            if (activoId != null) {
                query.distinct(true);
                Join<RegistroPorteriaEntity, RegistroPorteriaActivoEntity> join = root.join("activos", JoinType.INNER);
                predicates.add(cb.equal(join.get("activoId"), activoId));
            }
            if (estado != null) {
                predicates.add(cb.equal(root.get("estado"), estado));
            }
            if (fechaDesde != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("fechaHoraSalida"), fechaDesde));
            }
            if (fechaHasta != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("fechaHoraSalida"), fechaHasta));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return springRepository.findAll(spec, pageable).map(mapper::toDomain);
    }

    /**
     * Filtra registros donde el funcionario que sale ({@code empleadoId}) o el guardia que registró
     * la salida/llegada ({@code guardiaSalidaId}, {@code guardiaLlegadaId}) pertenezca al área indicada.
     */
    private Predicate empleadoPerteneceAArea(
            Root<RegistroPorteriaEntity> root,
            CriteriaQuery<?> query,
            CriteriaBuilder cb,
            UUID areaId
    ) {
        Subquery<UUID> subEmpleado = query.subquery(UUID.class);
        Root<EmpleadoEntity> emp = subEmpleado.from(EmpleadoEntity.class);
        subEmpleado.select(emp.get("id"))
                .where(cb.equal(emp.get("areaId"), areaId));

        Subquery<UUID> subGuardiaSalida = query.subquery(UUID.class);
        Root<EmpleadoEntity> gs = subGuardiaSalida.from(EmpleadoEntity.class);
        subGuardiaSalida.select(gs.get("id"))
                .where(cb.equal(gs.get("areaId"), areaId));

        Subquery<UUID> subGuardiaLlegada = query.subquery(UUID.class);
        Root<EmpleadoEntity> gl = subGuardiaLlegada.from(EmpleadoEntity.class);
        subGuardiaLlegada.select(gl.get("id"))
                .where(cb.equal(gl.get("areaId"), areaId));

        return cb.or(
                root.get("empleadoId").in(subEmpleado),
                root.get("guardiaSalidaId").in(subGuardiaSalida),
                root.get("guardiaLlegadaId").in(subGuardiaLlegada)
        );
    }
}
