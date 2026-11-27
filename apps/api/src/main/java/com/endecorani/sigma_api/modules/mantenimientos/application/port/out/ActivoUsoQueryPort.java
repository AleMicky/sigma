package com.endecorani.sigma_api.modules.mantenimientos.application.port.out;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;

/**
 * Puerto de lectura desacoplado para consultar lecturas de uso (kilometraje y horas de uso)
 * desde activos sin acoplar el dominio de mantenimientos a entidades JPA de activos.
 */
public interface ActivoUsoQueryPort {

    record LecturaUso(BigDecimal kilometrajeActual, BigDecimal horasUsoActual) {
        public static LecturaUso vacia() {
            return new LecturaUso(null, null);
        }
    }

    LecturaUso obtenerLecturaUso(UUID activoId);

    Map<UUID, LecturaUso> obtenerLecturasUsoPorActivos(Collection<UUID> activoIds);
}
