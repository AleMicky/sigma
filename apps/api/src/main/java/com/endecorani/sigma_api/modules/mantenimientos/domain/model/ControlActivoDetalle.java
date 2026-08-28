package com.endecorani.sigma_api.modules.mantenimientos.domain.model;

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
public class ControlActivoDetalle extends AuditableModel {
    private UUID id;
    private UUID controlActivoId;
    private UUID accesorioId;
    private Integer cantidadEsperada;
    private Integer cantidadEncontrada;
    private boolean conforme;
    private String observacion;
}