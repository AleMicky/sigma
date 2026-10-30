package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.reporte;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudItemPdfDto {
    private String numero;
    private String fechaSolicitud;
    private String fechaSalida;
    private String fechaRetorno;
    private String solicitante;
    private String tipoSolicitud;
    private String destinoMotivo;
    private Integer pasajeros;
    private String vehiculo;
    private String conductor;
    private String estado;
    private String asignadoPor;
}

