package com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.reporte;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ControlActivoAccesorioReporteDto {
    private Integer numero;
    private String codigo;
    private String nombre;
    private Integer cantidadEsperada;
    private Integer cantidadEncontrada;
    private String estadoConformidad;
    private String observacion;
}
