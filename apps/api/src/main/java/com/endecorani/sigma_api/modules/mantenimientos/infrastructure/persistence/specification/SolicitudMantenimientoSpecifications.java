package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.specification;

import com.endecorani.sigma_api.modules.mantenimientos.domain.criteria.SolicitudMantenimientoSearchCriteria;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.SolicitudMantenimientoEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class SolicitudMantenimientoSpecifications {

    private SolicitudMantenimientoSpecifications() {
    }

    public static Specification<SolicitudMantenimientoEntity> withCriteria(
            SolicitudMantenimientoSearchCriteria criteria
    ) {
        return (root, query, cb) -> {
            if (criteria == null) {
                return cb.conjunction();
            }

            List<Predicate> predicates = new ArrayList<>();

            if (criteria.query() != null && !criteria.query().isBlank()) {
                String pattern = "%" + criteria.query().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("numero")), pattern),
                        cb.like(cb.lower(root.get("titulo")), pattern),
                        cb.like(cb.lower(root.get("descripcion")), pattern)
                ));
            }

            if (criteria.estado() != null && !criteria.estado().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("estado")), criteria.estado().trim().toLowerCase()));
            }

            if (criteria.solicitanteId() != null) {
                predicates.add(cb.equal(root.get("solicitanteId"), criteria.solicitanteId()));
            }

            if (criteria.responsableId() != null) {
                predicates.add(cb.equal(root.get("responsableId"), criteria.responsableId()));
            }

            if (criteria.supervisorId() != null) {
                predicates.add(cb.equal(root.get("supervisorId"), criteria.supervisorId()));
            }

            if (criteria.activoId() != null) {
                predicates.add(cb.equal(root.get("activoId"), criteria.activoId()));
            }

            if (criteria.prioridadId() != null) {
                predicates.add(cb.equal(root.get("prioridadId"), criteria.prioridadId()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
