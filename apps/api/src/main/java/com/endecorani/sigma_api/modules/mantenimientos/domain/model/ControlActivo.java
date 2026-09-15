package com.endecorani.sigma_api.modules.mantenimientos.domain.model;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoControlActivo;
import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ControlActivo extends AuditableModel {
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

    @Builder.Default
    private List<ControlActivoDetalle> detalles = new ArrayList<>();
}