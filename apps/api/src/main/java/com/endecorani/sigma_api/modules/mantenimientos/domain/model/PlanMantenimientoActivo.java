package com.endecorani.sigma_api.modules.mantenimientos.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PlanMantenimientoActivo extends AuditableModel {

    private UUID id;

    private UUID planMantenimientoId;

    private UUID activoId;

    private UUID responsableId;

    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    private Boolean activo;
}
