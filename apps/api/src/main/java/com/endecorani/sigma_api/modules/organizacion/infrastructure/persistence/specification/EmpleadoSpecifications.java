package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.specification;

import com.endecorani.sigma_api.modules.organizacion.application.dto.EmpleadoSearchCriteria;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.PersonaEntity;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
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
            List<Predicate> predicates = new ArrayList<>();

            addEqualIfPresent(predicates, cb, root.get("personaId"), criteria.personaId());
            addEqualIfPresent(predicates, cb, root.get("areaId"), criteria.areaId());
            addEqualIfPresent(predicates, cb, root.get("cargoId"), criteria.cargoId());

            if (criteria.query() != null && !criteria.query().isBlank()) {
                String pattern = "%" + criteria.query().trim().toLowerCase() + "%";

                Subquery<UUID> personaSubquery = query.subquery(UUID.class);
                Root<PersonaEntity> personaRoot = personaSubquery.from(PersonaEntity.class);
                personaSubquery.select(personaRoot.get("id"));

                Expression<String> concatNombres = cb.concat(
                        cb.concat(
                                cb.coalesce(personaRoot.get("nombres"), ""),
                                " "
                        ),
                        cb.concat(
                                cb.coalesce(personaRoot.get("primerApellido"), ""),
                                cb.concat(
                                        " ",
                                        cb.coalesce(personaRoot.get("segundoApellido"), "")
                                )
                        )
                );

                Predicate personaMatch = cb.or(
                        cb.like(cb.lower(personaRoot.get("nombres")), pattern),
                        cb.like(cb.lower(personaRoot.get("primerApellido")), pattern),
                        cb.like(cb.lower(personaRoot.get("segundoApellido")), pattern),
                        cb.like(cb.lower(personaRoot.get("numeroDocumento")), pattern),
                        cb.like(cb.lower(concatNombres), pattern)
                );

                personaSubquery.where(personaMatch);

                predicates.add(
                        cb.or(
                                cb.like(cb.lower(root.get("codigo")), pattern),
                                root.get("personaId").in(personaSubquery)
                        )
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static void addEqualIfPresent(
            List<Predicate> predicates,
            CriteriaBuilder cb,
            Path<UUID> path,
            UUID value
    ) {
        if (value != null) {
            predicates.add(cb.equal(path, value));
        }
    }
}
