package com.endecorani.sigma_api.modules.mantenimientos.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ControlActivoDetalle {
    private UUID id;
    private UUID controlActivoId;
    private UUID accesorioId;
    private Integer cantidadEsperada;
    private Integer cantidadEncontrada;
    private boolean conforme;
    private String observacion;
    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;
}