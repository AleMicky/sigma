package com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.reporte;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrdenTrabajoActividadReporteDto {
    private Integer numero;
    private String descripcion;
    private String estado;
    private String fechaRealizacion;
    private String observacion;
}
