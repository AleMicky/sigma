package com.endecorani.sigma_api.modules.gestionvehicular.domain.model;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoRegistroPorteria;
import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class RegistroPorteria extends AuditableModel {
    private UUID id;
    private String numero;
    private UUID empleadoId;
    private Boolean esExterno;
    private String personaExterna;
    private String placaExterna;
    private UUID guardiaSalidaId;
    private UUID guardiaLlegadaId;
    private UUID salidaVehicularId;
    private Instant fechaHoraSalida;
    private Instant fechaHoraLlegada;
    private EstadoRegistroPorteria estado;
    private String observacionSalida;
    private String observacionLlegada;

    @Builder.Default
    private List<RegistroPorteriaActivo> activos = new ArrayList<>();
}

