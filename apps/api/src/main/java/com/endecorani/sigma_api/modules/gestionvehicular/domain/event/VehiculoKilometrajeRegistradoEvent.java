package com.endecorani.sigma_api.modules.gestionvehicular.domain.event;

import java.util.UUID;

/**
 * Evento emitido cuando un vehículo registra un retorno con nueva lectura de odómetro / kilometraje.
 */
public record VehiculoKilometrajeRegistradoEvent(
        UUID activoId,
        Long kilometraje,
        String origen
) {}
