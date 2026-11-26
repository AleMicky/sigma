package com.endecorani.sigma_api.modules.gestionvehicular.domain.util;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoLicenciaConductor;

import java.time.LocalDate;

/** REQ-VEH-011: regla pura de vigencia de licencias, compartida por licencias y asignaciones. */
public final class LicenciaVigencia {

    private LicenciaVigencia() {
    }

    public static boolean rangoValido(LocalDate fechaEmision, LocalDate fechaVencimiento) {
        return fechaEmision != null && fechaVencimiento != null && !fechaVencimiento.isBefore(fechaEmision);
    }

    public static boolean vigenteAFecha(
            EstadoLicenciaConductor estado,
            Boolean activo,
            LocalDate fechaEmision,
            LocalDate fechaVencimiento,
            LocalDate fechaReferencia
    ) {
        return estado == EstadoLicenciaConductor.VIGENTE
                && !Boolean.FALSE.equals(activo)
                && fechaReferencia != null
                && rangoValido(fechaEmision, fechaVencimiento)
                && !fechaReferencia.isBefore(fechaEmision)
                && !fechaReferencia.isAfter(fechaVencimiento);
    }
}
