package com.endecorani.sigma_api.modules.mantenimientos.domain.model;


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
public class SolicitudMantenimientoTrazabilidad  {
    private UUID id;
    private UUID solicitudMantenimientoId;
    private String estadoAnterior;
    private String estadoNuevo;
    private String comentario;
    private UUID empleadoId;
    private LocalDateTime fecha;
}