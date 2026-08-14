package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.specification;

import com.endecorani.sigma_api.modules.activos.domain.repository.DocumentosSearchCriteria;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.DocumentosEntity;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class DocumentosSpecifications {

    private DocumentosSpecifications() {
    }

    public static Specification<DocumentosEntity> withCriteria(
            DocumentosSearchCriteria criteria
    ) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            addEqualIfPresent(predicates, cb, root.get("activoId"), criteria.activoId());
            addEqualIfPresent(
                    predicates,
                    cb,
                    root.get("tipoDocumentoId"),
                    criteria.tipoDocumentoId()
            );

            if (criteria.query() != null) {
                String pattern = "%" + criteria.query().toLowerCase() + "%";
                predicates.add(
                        cb.or(
                                cb.like(cb.lower(root.get("nombre")), pattern),
                                cb.like(cb.lower(root.get("descripcion")), pattern)
                        )
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
