package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.response;

import lombok.Builder;

import java.util.Map;
import java.util.UUID;

@Builder
public record FlotaVehiculoActivoInfo(
        UUID id,
        String codigo,
        String nombre,
        String descripcion,
        String urlImagen,
        String placa,
        String tipoActivo,
        String marca,
        String modelo,
        String anio,
        String color,
        Map<String, String> atributos,
        String responsableNombre,
        String responsableArea,
        String responsableCargo,
        UUID estadoOperativoId,
        String estadoOperativoCodigo,
        String estadoOperativoNombre,
        String estadoOperativoColor
) {
    public FlotaVehiculoActivoInfo(
            UUID id,
            String codigo,
            String nombre,
            String descripcion,
            String urlImagen
    ) {
        this(id, codigo, nombre, descripcion, urlImagen, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
    }
}
