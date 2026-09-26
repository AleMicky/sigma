package com.endecorani.sigma_api.modules.gestionvehicular.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SolicitudVehicular extends AuditableModel {
    private UUID id;
    private String numero;
    private UUID tipoSolicitudVehicularId;
    private UUID solicitanteId;
    private String motivo;
    private String justificacion;
    private String destino;
    private LocalDateTime fechaSalida;
    private LocalDateTime fechaRetornoEstimada;
    private Integer cantidadPasajeros;
    private String observacion;
    private String estado;
    private String processInstanceId;
}
