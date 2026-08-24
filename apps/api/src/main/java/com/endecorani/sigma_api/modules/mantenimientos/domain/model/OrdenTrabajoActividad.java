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
public class OrdenTrabajoActividad extends AuditableModel {

    private UUID id;

    private UUID ordenTrabajoId;

    /*
     * Opcional.
     * Si viene de catálogo se guarda el ID.
     * En correctivo puede ser null.
     */
    private UUID actividadMantenimientoId;

    private String descripcion;

    private boolean realizado;

    private String observacion;

    private LocalDateTime fechaRealizacion;
}