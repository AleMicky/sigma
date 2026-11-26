package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResponse;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Clasificación pura de estados operativos, compartida por el reporte Excel y
 * por la regla usada en la agregación SQL (REQ-BIZ-020).
 *
 * Un activo está de baja cuando {@code activo = false} O su estado es
 * {@code DE_BAJA} (ignorando mayúsculas). Esa condición es excluyente y gana
 * sobre cualquier otro código; por eso los seis cubos son disjuntos y suman
 * el total. Los estados no catalogados se agrupan con OPERATIVO para conservar
 * la partición, igual que en {@code SpringActivoRepository.summarize}.
 */
public final class ActivoEstadoClasificador {

    public enum Categoria {
        DE_BAJA,
        EN_MANTENIMIENTO,
        FUERA_SERVICIO,
        RESERVA,
        EN_VIAJE,
        OPERATIVO
    }

    private ActivoEstadoClasificador() {
    }

    public static Categoria clasificar(Boolean activo, String codigoEstado) {
        String codigo = codigoEstado == null ? null : codigoEstado.trim().toUpperCase(Locale.ROOT);

        if (Boolean.FALSE.equals(activo) || "DE_BAJA".equals(codigo)) {
            return Categoria.DE_BAJA;
        }
        if ("MANTENIMIENTO".equals(codigo)) {
            return Categoria.EN_MANTENIMIENTO;
        }
        if ("FUERA_SERVICIO".equals(codigo)) {
            return Categoria.FUERA_SERVICIO;
        }
        if ("RESERVA".equals(codigo)) {
            return Categoria.RESERVA;
        }
        if ("EN_VIAJE".equals(codigo)) {
            return Categoria.EN_VIAJE;
        }
        return Categoria.OPERATIVO;
    }

    public static boolean esDeBaja(Boolean activo, String codigoEstado) {
        return clasificar(activo, codigoEstado) == Categoria.DE_BAJA;
    }

    /** Conteos agregados con las mismas reglas que el endpoint /resumen. */
    public record Conteo(
            long total,
            long deBaja,
            long enMantenimiento,
            long operativos,
            long operativo,
            long reserva,
            long enViaje,
            long fueraServicio,
            long disponibles,
            double tasaDisponibilidad
    ) {

        public static Conteo de(List<ActivoResponse> activos) {
            Map<Categoria, Long> conteos = activos.stream()
                    .collect(Collectors.groupingBy(
                            activo -> clasificar(
                                    activo.activo(),
                                    activo.estadoOperativo() != null
                                            ? activo.estadoOperativo().codigo()
                                            : null),
                            Collectors.counting()));

            long total = activos.size();
            long deBaja = conteos.getOrDefault(Categoria.DE_BAJA, 0L);
            long enMantenimiento = conteos.getOrDefault(Categoria.EN_MANTENIMIENTO, 0L);
            long fueraServicio = conteos.getOrDefault(Categoria.FUERA_SERVICIO, 0L);
            long reserva = conteos.getOrDefault(Categoria.RESERVA, 0L);
            long enViaje = conteos.getOrDefault(Categoria.EN_VIAJE, 0L);
            long operativo = conteos.getOrDefault(Categoria.OPERATIVO, 0L);
            long operativos = total - deBaja - enMantenimiento;
            long disponibles = operativo + reserva + enViaje;
            double tasaDisponibilidad = total > 0 ? disponibles * 100.0 / total : 0.0;

            return new Conteo(
                    total, deBaja, enMantenimiento, operativos,
                    operativo, reserva, enViaje, fueraServicio,
                    disponibles, tasaDisponibilidad);
        }
    }
}
