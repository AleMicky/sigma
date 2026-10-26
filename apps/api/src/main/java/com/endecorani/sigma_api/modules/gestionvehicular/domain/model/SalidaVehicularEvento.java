package com.endecorani.sigma_api.modules.gestionvehicular.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SalidaVehicularEvento extends AuditableModel {
    private UUID id;

    private UUID salidaVehicularId;

    private UUID empleadoId;

    private String tipoEvento;

    private Instant fechaHora;

    private BigDecimal kilometraje;

    private BigDecimal latitud;

    private BigDecimal longitud;

    private String observacion;

}

