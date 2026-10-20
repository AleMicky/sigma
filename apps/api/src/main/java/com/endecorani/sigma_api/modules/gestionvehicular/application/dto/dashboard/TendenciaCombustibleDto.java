package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TendenciaCombustibleDto {
    private String periodo;       // ej: "2026-01"
    private String mesLabel;      // ej: "Ene 2026"
    private BigDecimal totalLitros;
    private BigDecimal totalCosto;
    private int cantidadCargas;
}
