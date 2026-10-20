package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertaLicenciaConductorDto {
    private UUID conductorId;
    private String conductorNombre;
    private String conductorCodigo;
    private String numeroLicencia;
    private String categoria;
    private LocalDate fechaVencimiento;
    private long diasRestantes;
    private String nivelAlerta; // "VENCIDA", "CRITICA" (<= 7 días), "ADVERTENCIA" (<= 30 días)
}
