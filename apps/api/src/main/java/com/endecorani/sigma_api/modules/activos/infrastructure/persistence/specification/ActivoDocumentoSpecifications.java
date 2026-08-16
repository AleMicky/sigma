package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.specification;

import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoDocumentoSearchCriteria;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoDocumentoEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ActivoDocumentoSpecifications {

    public static Specification<ActivoDocumentoEntity> withCriteria(ActivoDocumentoSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria.activoId() != null) {
                predicates.add(cb.equal(root.get("activo").get("id"), criteria.activoId()));
            }

            if (criteria.tipoDocumentoId() != null) {
                predicates.add(cb.equal(root.get("tipoDocumento").get("id"), criteria.tipoDocumentoId()));
            }

            if (criteria.query() != null && !criteria.query().isBlank()) {
                String likePattern = "%" + criteria.query().toLowerCase() + "%";
                Predicate nombrePredicate = cb.like(cb.lower(root.get("nombre")), likePattern);
                Predicate descripcionPredicate = cb.like(cb.lower(root.get("descripcion")), likePattern);
                Predicate numeroPredicate = cb.like(cb.lower(root.get("numeroDocumento")), likePattern);
                predicates.add(cb.or(nombrePredicate, descripcionPredicate, numeroPredicate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
