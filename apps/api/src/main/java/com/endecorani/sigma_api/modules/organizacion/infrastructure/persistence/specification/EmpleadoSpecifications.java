package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.specification;

import com.endecorani.sigma_api.modules.organizacion.application.dto.EmpleadoSearchCriteria;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoEntity;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class EmpleadoSpecifications {

    private EmpleadoSpecifications() {
    }

    public static Specification<EmpleadoEntity> withCriteria(
            EmpleadoSearchCriteria criteria
    ) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            addEqualIfPresent(predicates, cb, root.get("personaId"), criteria.personaId());
            addEqualIfPresent(predicates, cb, root.get("areaId"), criteria.areaId());
            addEqualIfPresent(predicates, cb, root.get("cargoId"), criteria.cargoId());

            if (criteria.query() != null && !criteria.query().isBlank()) {
                String pattern = "%" + criteria.query().trim().toLowerCase() + "%";
                predicates.add(
                        cb.like(cb.lower(root.get("codigo")), pattern)
                );
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private static void addEqualIfPresent(
            List<jakarta.persistence.criteria.Predicate> predicates,
            jakarta.persistence.criteria.CriteriaBuilder cb,
            jakarta.persistence.criteria.Path<UUID> path,
            UUID value
    ) {
        if (value != null) {
            predicates.add(cb.equal(path, value));
        }
    }
}
