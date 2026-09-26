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
public class AsignacionVehicular extends AuditableModel {
    private UUID id;
    private UUID solicitudVehicularId;
    private UUID activoId;
    private UUID conductorId;
    private UUID asignadoPorId;
    private LocalDateTime fechaAsignacion;
    private String observacion;
}
