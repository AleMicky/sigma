package com.endecorani.sigma_api.modules.gestionvehicular.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CargaCombustible extends AuditableModel {
    private UUID id;
    private UUID activoId;
    private UUID viajeVehicularId;

    private UUID insumoId;

    private LocalDateTime fechaCarga;

    private BigDecimal litros;
    private BigDecimal precioTotal;

    private String numeroFactura;
    private UUID empleadoId;
}
