package com.endecorani.sigma_api.modules.organizacion.domain.model;

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
public class EmpleadoResponsabilidad extends AuditableModel {

    private UUID id;

    private UUID empleadoId;

    private UUID responsabilidadId;

    private LocalDate fechaInicio;

    private LocalDate fechaFin;
}