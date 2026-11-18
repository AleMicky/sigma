package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.reporte;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * DTO de fila para la plantilla JasperReports de la bitácora de portería.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BitacoraPorteriaItemPdfDto {
    private UUID id;
    private Integer dia;
    private String numero;
    private String fechaSalidaTexto;
    private String horaSalidaLlegadaTexto;
    private String funcionarioTexto;
    private String activosTexto;
    private String rutaTexto;
    private String guardiasTexto;
    private String estadoObservacionesTexto;
}
