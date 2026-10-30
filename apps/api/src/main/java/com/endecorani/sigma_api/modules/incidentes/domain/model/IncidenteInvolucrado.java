package com.endecorani.sigma_api.modules.incidentes.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class IncidenteInvolucrado extends AuditableModel {

    private UUID id;
    private UUID incidenteActivoId;
    private String tipoInvolucrado;
    private UUID empleadoId;
    private String nombre;
    private String documentoIdentidad;
    private String descripcion;
}
