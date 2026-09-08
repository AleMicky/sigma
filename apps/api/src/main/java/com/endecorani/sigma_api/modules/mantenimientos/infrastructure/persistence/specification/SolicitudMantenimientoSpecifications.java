package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.specification;

import com.endecorani.sigma_api.modules.mantenimientos.domain.criteria.SolicitudMantenimientoSearchCriteria;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.SolicitudMantenimientoEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.Arrays;
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
                String raw = criteria.estado().trim().toUpperCase();
                if (raw.contains(",")) {
                    List<String> list = Arrays.stream(raw.split(","))
                            .map(String::trim)
                            .filter(s -> !s.isBlank())
                            .toList();
                    predicates.add(cb.upper(root.get("estado")).in(list));
                } else if ("EN_REVISION".equals(raw) || "EN-REVISION".equals(raw) || "REVISION".equals(raw)) {
                    predicates.add(cb.upper(root.get("estado")).in(List.of("SOLICITADO", "OBSERVADO")));
                } else if ("EN_PROCESO".equals(raw) || "EN-PROCESO".equals(raw) || "PROCESO".equals(raw)) {
                    predicates.add(cb.upper(root.get("estado")).in(List.of(
                            "ASIGNADO",
                            "EN_MANTENIMIENTO",
                            "EN_REVISION",
                            "OBSERVADO_MANTENIMIENTO",
                            "VALIDADO"
                    )));
                } else if ("FINALIZADAS".equals(raw) || "FINALIZADO".equals(raw) || "FINALIZADA".equals(raw) || "CERRADO".equals(raw)) {
                    predicates.add(cb.upper(root.get("estado")).in(List.of("TRABAJO_REALIZADO", "FINALIZADO", "CERRADO")));
                } else if ("BORRADOR".equals(raw) || "BORRADORES".equals(raw)) {
                    predicates.add(cb.equal(cb.upper(root.get("estado")), "BORRADOR"));
                } else {
                    predicates.add(cb.equal(cb.upper(root.get("estado")), raw));
                }
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
