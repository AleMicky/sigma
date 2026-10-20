package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TendenciaViajesDto {
    private String periodo;       // ej: "2026-01"
    private String mesLabel;      // ej: "Ene 2026"
    private int totalViajes;
    private int completados;
    private int cancelados;
    private int enCurso;
    private long totalKmRecorridos;
}
