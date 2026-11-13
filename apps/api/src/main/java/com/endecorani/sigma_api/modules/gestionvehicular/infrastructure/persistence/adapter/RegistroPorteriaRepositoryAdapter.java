package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoRegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.RegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.RegistroPorteriaRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.RegistroPorteriaActivoEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.RegistroPorteriaEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.RegistroPorteriaPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringRegistroPorteriaRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
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

                Subquery<UUID> subEmp = query.subquery(UUID.class);
                Root<VEmpleadoEntity> vemp = subEmp.from(VEmpleadoEntity.class);
                subEmp.select(vemp.get("empleadoId"))
                        .where(cb.or(
                                cb.like(cb.lower(cb.coalesce(vemp.get("nombreCompleto"), "")), pattern),
                                cb.like(cb.lower(cb.coalesce(vemp.get("codigo"), "")), pattern)
                        ));

                Subquery<UUID> subActivo = query.subquery(UUID.class);
                Root<ActivoEntity> act = subActivo.from(ActivoEntity.class);
                subActivo.select(act.get("id"))
                        .where(cb.or(
                                cb.like(cb.lower(cb.coalesce(act.get("codigo"), "")), pattern),
                                cb.like(cb.lower(cb.coalesce(act.get("nombre"), "")), pattern)
                        ));

                Subquery<UUID> subItem = query.subquery(UUID.class);
                Root<RegistroPorteriaActivoEntity> item = subItem.from(RegistroPorteriaActivoEntity.class);
                subItem.select(item.get("registroPorteriaId"))
                        .where(cb.or(
                                cb.like(cb.lower(cb.coalesce(item.get("descripcionItem"), "")), pattern),
                                cb.like(cb.lower(cb.coalesce(item.get("observacionSalida"), "")), pattern),
                                cb.like(cb.lower(cb.coalesce(item.get("observacionLlegada"), "")), pattern),
                                item.get("activoId").in(subActivo)
                        ));

                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("numero")), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get("personaExterna"), "")), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get("placaExterna"), "")), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get("destinoOtro"), "")), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get("observacionSalida"), "")), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get("observacionLlegada"), "")), pattern),
                        root.get("empleadoId").in(subEmp),
                        root.get("guardiaSalidaId").in(subEmp),
                        root.get("guardiaLlegadaId").in(subEmp),
                        root.get("id").in(subItem)
                ));
            }
            if (empleadoId != null) {
                predicates.add(cb.equal(root.get("empleadoId"), empleadoId));
            }
            if (areaId != null) {
                predicates.add(empleadoPerteneceAArea(root, query, cb, areaId));
            }
            if (activoId != null) {
                Subquery<UUID> subAct = query.subquery(UUID.class);
                Root<RegistroPorteriaActivoEntity> actItemRoot = subAct.from(RegistroPorteriaActivoEntity.class);
                subAct.select(actItemRoot.get("registroPorteriaId"))
                        .where(cb.equal(actItemRoot.get("activoId"), activoId));
                predicates.add(root.get("id").in(subAct));
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
