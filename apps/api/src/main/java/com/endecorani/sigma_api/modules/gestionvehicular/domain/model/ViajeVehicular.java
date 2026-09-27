package com.endecorani.sigma_api.modules.gestionvehicular.domain.model;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;
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
public class ViajeVehicular extends AuditableModel {
    private UUID id;
    private UUID asignacionVehicularId;
    private LocalDateTime fechaSalidaReal;
    private Long kilometrajeSalida;
    private LocalDateTime fechaRetornoReal;
    private Long kilometrajeRetorno;
    private EstadoViajeVehicular estado;
    private String observacion;
}
