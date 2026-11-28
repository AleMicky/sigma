package com.endecorani.sigma_api.modules.cuestionarios.application.dto.response;

public record DisparadorCatalogoResponse(
        String moduloOrigen,
        String moduloEtiqueta,
        String entidadTipo,
        String entidadEtiqueta,
        String eventoDisparador,
        String eventoEtiqueta,
        String descripcion,
        String evaluadoTipoDefecto
) {}
