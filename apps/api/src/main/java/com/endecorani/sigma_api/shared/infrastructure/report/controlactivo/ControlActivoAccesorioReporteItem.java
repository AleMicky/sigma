package com.endecorani.sigma_api.shared.infrastructure.report.controlactivo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ControlActivoAccesorioReporteItem {
    private Integer numero;
    private String codigo;
    private String nombre;
    private Integer cantidadEsperada;
    private Integer cantidadEncontrada;
    private String estadoConformidad;
    private String observacion;
}
