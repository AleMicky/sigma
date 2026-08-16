package com.endecorani.sigma_api.modules.activos.domain.model;

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
public class ActivoAsignacion extends AuditableModel {

    private UUID id;

    private UUID activoId;

    private UUID empleadoId;

    private UUID areaId;

    private UUID ubicacionId;

    private LocalDateTime fechaAsignacion;

    private LocalDateTime fechaDevolucion;

    private String observacionAsignacion;

    private String observacionDevolucion;
}
