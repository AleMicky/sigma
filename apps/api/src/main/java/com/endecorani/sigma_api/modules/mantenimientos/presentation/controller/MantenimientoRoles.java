package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

/**
 * REQ-MANT-001: matriz de autorización aprobada para el módulo de mantenimientos.
 *
 * <p>Se usan expresiones {@code hasRole('...')} (sin el prefijo {@code ROLE_}) porque
 * {@code KeycloakJwtAuthenticationConverter} ya lo agrega a las autoridades del JWT.</p>
 *
 * <p>{@code CONDUCTOR} y {@code SOLICITANTE_MOVILIDAD} quedan explícitamente fuera del módulo.
 * Las operaciones de solo lectura (catálogos, listados y reportes) incluyen a los cuatro roles
 * del módulo para no contradecir los menús sembrados en {@code V159}.</p>
 */
public final class MantenimientoRoles {

    /** Lectura de catálogos, listados, trazabilidad y reportes. */
    public static final String LECTURA =
            "hasRole('ADMIN') or hasRole('SUPERVISOR') or hasRole('ENCARGADO') or hasRole('SOLICITANTE')";

    /** Alta, edición, envío y baja de solicitudes propias. */
    public static final String SOLICITUD =
            "hasRole('ADMIN') or hasRole('SOLICITANTE')";

    /** Aprobación y revisión de solicitudes. */
    public static final String APROBACION =
            "hasRole('ADMIN') or hasRole('SUPERVISOR')";

    /** Órdenes de trabajo, controles, planes, actividades y programaciones. */
    public static final String OPERACION =
            "hasRole('ADMIN') or hasRole('ENCARGADO')";

    /**
     * REQ-MANT-028: las acciones propias del solicitante usan {@link #LECTURA}, pero la
     * transición de aprobación exige {@link #APROBACION}. El servicio valida además que el
     * actor sea el asignado y que el aprobador sea SUPERVISOR/ADMIN distinto del actor.
     */
    public static final String WORKFLOW =
            "(" + LECTURA + ") and "
                    + "(!@mantenimientoWorkflowAccess.esAprobacion(#p1) or (" + APROBACION + "))";

    private MantenimientoRoles() {
    }
}
