package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

/**
 * REQ-VEH-002: matriz de autorización aprobada para el módulo de gestión vehicular.
 *
 * <p>Se usan expresiones {@code hasRole('...')} (sin el prefijo {@code ROLE_}) porque
 * {@code KeycloakJwtAuthenticationConverter} ya lo agrega a las autoridades del JWT.
 * No existe el rol {@code PORTERO}: la operación de portería la ejecutan
 * {@code ADMIN} y {@code ENCARGADO_MOVILIDADES}.</p>
 */
public final class GestionVehicularRoles {

    /** Escritura/flujo de salidas, asignaciones, portería y operaciones de flota. */
    public static final String OPERACION =
            "hasRole('ADMIN') or hasRole('ENCARGADO_MOVILIDADES')";

    /** Solicitudes: el solicitante y el conductor operan sobre su ámbito propio (dotado por SecurityUtils). */
    public static final String SOLICITUD =
            "hasRole('SOLICITANTE_MOVILIDAD') or hasRole('CONDUCTOR') or "
                    + "hasRole('ENCARGADO_MOVILIDADES') or hasRole('ADMIN')";

    /**
     * Reportes, dashboard, bitácora y exportaciones (solo lectura).
     *
     * <p>{@code CONDUCTOR} y {@code SOLICITANTE_MOVILIDAD} se incluyen para que
     * la API no contradiga los menús ya sembrados en {@code V159:700,717};
     * las operaciones de escritura siguen restringidas a {@link #OPERACION}.</p>
     */
    public static final String REPORTE =
            "hasRole('ADMIN') or hasRole('ENCARGADO_MOVILIDADES') or hasRole('SUPERVISOR') "
                    + "or hasRole('CONDUCTOR') or hasRole('SOLICITANTE_MOVILIDAD')";

    private GestionVehicularRoles() {
    }
}
