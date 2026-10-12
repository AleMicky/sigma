package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.cargacombustible.response;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;

import java.time.LocalDateTime;
import java.util.UUID;

public record CargaCombustibleViajeInfo(
        UUID id,
        EstadoViajeVehicular estado,
        LocalDateTime fechaSalidaReal,
        LocalDateTime fechaRetornoReal
) {
}
