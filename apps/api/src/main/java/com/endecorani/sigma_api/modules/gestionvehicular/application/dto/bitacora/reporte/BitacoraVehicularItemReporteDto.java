package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.bitacora.reporte;

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
public class BitacoraVehicularItemReporteDto {
    private UUID id;
    private Integer dia;
    private String diaSemana;
    private String tipoRegistro;
    private Long kmSalida;
    private Long kmLlegada;
    private Long kmRecorrido;
    private String descripcionTrabajo;
    private String solicitudNumero;
    private String combustibleFactura;
    private BigDecimal combustibleLitros;
    private BigDecimal combustibleImporte;
    private String supervisorNombre;
    private Boolean supervisorVoBo;
    private String observaciones;
    private String conductorNombre;
    private String conductorLicencia;
}
