package com.endecorani.sigma_api.modules.incidentes.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class IncidenteActivo extends AuditableModel {

    private UUID id;
    private UUID activoId;
    private String tipoIncidente;
    private String prioridad;
    private String estado;
    private LocalDateTime fechaHora;
    private String ubicacion;
    private BigDecimal latitud;
    private BigDecimal longitud;
    private String descripcion;
    private UUID empleadoReportaId;
    private String processInstanceId;

    @Builder.Default
    private List<IncidenteInvolucrado> involucrados = new ArrayList<>();

    @Builder.Default
    private List<IncidenteEvidencia> evidencias = new ArrayList<>();
}
