package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.response;

import java.util.UUID;

public record AsignacionVehicularActivoInfo(
        UUID id,
        String codigo,
        String nombre,
        String placa,
        UUID estadoOperativoId,
        String estadoOperativoCodigo,
        String estadoOperativoNombre,
        String estadoOperativoColor
) {
    public AsignacionVehicularActivoInfo(UUID id, String codigo, String nombre, String placa) {
        this(id, codigo, nombre, placa, null, null, null, null);
    }
}
