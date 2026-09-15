package com.endecorani.sigma_api.modules.mantenimientos.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ActividadMantenimiento extends AuditableModel {
    private UUID id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private Boolean aplicaTodosTiposActivo;
    private Boolean requiereChecklist;

    @Builder.Default
    private List<ActividadMantenimientoAplicacion> aplicaciones = new ArrayList<>();
}