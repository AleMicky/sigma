package com.endecorani.sigma_api.shared.infrastructure.persistence;

import org.springframework.data.jpa.domain.Specification;

public final class JpaSpecificationUtils {

    private JpaSpecificationUtils() {
    }

    public static <T> Specification<T> likeIgnoreCase(
            String attribute,
            String value
    ) {
        return (root, query, criteriaBuilder) -> {
            if (value == null || value.isBlank()) {
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.like(
                    criteriaBuilder.lower(
                            root.get(attribute)
                    ),
                    "%" + value.trim().toLowerCase() + "%"
            );
        };
    }

    public static <T> Specification<T> equal(
            String attribute,
            Object value
    ) {
        return (root, query, criteriaBuilder) -> {
            if (value == null) {
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.equal(
                    root.get(attribute),
                    value
            );
        };
    }

    public static <T> Specification<T> isTrue(
            String attribute
    ) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.isTrue(
                        root.get(attribute)
                );
    }

    public static <T> Specification<T> isFalse(
            String attribute
    ) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.isFalse(
                        root.get(attribute)
                );
    }
}
