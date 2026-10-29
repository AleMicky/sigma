package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.reporte;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BitacoraSalidaItemReporteDto {
    private UUID id;
    private Integer dia;
    private String fecha;
    private String descripcionActividad;
    private Long kmSalida;
    private Long kmLlegada;
    private Long kmRecorrido;
    private String combustibleTexto;
    private String conductorNombre;
    private String observaciones;
}

