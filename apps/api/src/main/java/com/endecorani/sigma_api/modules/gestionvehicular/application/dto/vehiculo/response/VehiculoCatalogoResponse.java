package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.vehiculo.response;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record VehiculoCatalogoResponse(
        UUID id,
        String codigo,
        String codigoAlternativo,
        String nombre,
        String descripcion,
        LocalDate fechaAdquisicion,
        String urlImagen,
        Boolean activo,
        TipoActivoInfo tipoActivo,
        UbicacionInfo ubicacion,
        EstadoOperativoInfo estadoOperativo,
        List<FlotaInfo> flotas,
        List<VehiculoAtributoResponse> atributos
) {
    public record TipoActivoInfo(
            UUID id,
            String nombre,
            String color,
            String icono
    ) {
    }

    public record UbicacionInfo(
            UUID id,
            String codigo,
            String nombre
    ) {
    }

    public record EstadoOperativoInfo(
            UUID id,
            String codigo,
            String nombre,
            String color
    ) {
    }

    public record FlotaInfo(
            UUID id,
            String codigo,
            String nombre
    ) {
    }
}
