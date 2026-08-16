package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.specification;

import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAsignacionSearchCriteria;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAsignacionEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ActivoAsignacionSpecifications {

    public static Specification<ActivoAsignacionEntity> withCriteria(ActivoAsignacionSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria.activoId() != null) {
                predicates.add(cb.equal(root.get("activo").get("id"), criteria.activoId()));
            }

            if (criteria.query() != null && !criteria.query().isBlank()) {
                String likePattern = "%" + criteria.query().toLowerCase() + "%";
                Predicate obsAsig = cb.like(cb.lower(root.get("observacionAsignacion")), likePattern);
                Predicate obsDev = cb.like(cb.lower(root.get("observacionDevolucion")), likePattern);
                predicates.add(cb.or(obsAsig, obsDev));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
