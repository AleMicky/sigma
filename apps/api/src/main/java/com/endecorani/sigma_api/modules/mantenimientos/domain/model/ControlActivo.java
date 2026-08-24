package com.endecorani.sigma_api.modules.mantenimientos.domain.model;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoControlActivo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ControlActivo {
    private UUID id;
    private UUID solicitudMantenimientoId;
    private UUID ordenTrabajoId;
    private UUID activoId;
    private TipoControlActivo tipo;
    private UUID entregadoPorId;
    private UUID recibidoPorId;
    private LocalDateTime fecha;
    private boolean conforme;
    private String observacion;
    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;
}