package com.endecorani.sigma_api.modules.activos.domain.enums;

/**
 * REQ-BIZ-007: estados de un documento según su fecha de vencimiento.
 * Coincide con los valores que Web muestra en la consulta de documentos.
 */
public enum DocumentoEstadoFilter {
    VIGENTE,
    POR_VENCER,
    VENCIDO,
    PERMANENTE;

    /** Umbral compartido con la utilidad Web getDocumentoEstado (30 días). */
    public static final int DIAS_POR_VENCER = 30;
}
