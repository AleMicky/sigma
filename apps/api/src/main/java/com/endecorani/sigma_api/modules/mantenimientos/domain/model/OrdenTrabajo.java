package com.endecorani.sigma_api.modules.mantenimientos.domain.model;
import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class OrdenTrabajo extends AuditableModel {

    private UUID id;

    private String numero;

    private UUID solicitudMantenimientoId;

    private UUID activoId;

    private UUID responsableId;

    private LocalDateTime fechaInicio;

    private LocalDateTime fechaFin;

    private String diagnostico;

    private String trabajoRealizado;

    private String observacion;
}