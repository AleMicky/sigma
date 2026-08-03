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
public class Empleado extends AuditableModel {

    private UUID id;

    private UUID personaId;

    private UUID areaId;

    private UUID cargoId;

    private String codigo;

    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    private String sistemaOrigen;

    private String codigoExterno;

    private Boolean activo;
}
