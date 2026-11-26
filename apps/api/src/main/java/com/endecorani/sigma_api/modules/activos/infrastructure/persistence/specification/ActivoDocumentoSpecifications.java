package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.specification;

import com.endecorani.sigma_api.modules.activos.domain.enums.DocumentoEstadoFilter;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoDocumentoSearchCriteria;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoDocumentoEntity;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
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

            if (criteria.estado() != null && criteria.fechaReferencia() != null) {
                predicates.add(estadoPredicate(
                        criteria.estado(),
                        root.get("fechaVencimiento"),
                        criteria.fechaReferencia(),
                        cb
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Misma regla que getDocumentoEstado de Web: sin vencimiento es
     * PERMANENTE; vencido si la fecha es anterior a hoy; POR_VENCER si está
     * entre hoy y hoy + {@link DocumentoEstadoFilter#DIAS_POR_VENCER};
     * en caso contrario VIGENTE.
     */
    private static Predicate estadoPredicate(
            DocumentoEstadoFilter estado,
            Path<LocalDate> fechaVencimiento,
            LocalDate hoy,
            jakarta.persistence.criteria.CriteriaBuilder cb
    ) {
        LocalDate limite = hoy.plusDays(DocumentoEstadoFilter.DIAS_POR_VENCER);
        return switch (estado) {
            case PERMANENTE -> cb.isNull(fechaVencimiento);
            case VENCIDO -> cb.lessThan(fechaVencimiento, hoy);
            case POR_VENCER -> cb.between(fechaVencimiento, hoy, limite);
            case VIGENTE -> cb.greaterThan(fechaVencimiento, limite);
        };
    }
}
