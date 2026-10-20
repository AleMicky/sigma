package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopVehiculoCombustibleDto {
    private UUID activoId;
    private String codigo;
    private String placa;
    private String marcaModelo;
    private BigDecimal totalLitros;
    private BigDecimal totalCosto;
    private int cantidadCargas;
}
