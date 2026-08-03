package com.endecorani.sigma_api.modules.organizacion.domain.model;

import com.endecorani.sigma_api.modules.organizacion.domain.enums.EstadoMigracion;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class RegistroMigracion {
    private UUID id;

    // Sistema de origen
    private String sistemaOrigen;

    // Entidad migrada
    private String entidad;

    // ID del registro en el sistema antiguo
    private String idOrigen;

    // UUID generado en SIGMA
    private UUID idDestino;

    // Estado de la migración
    private EstadoMigracion estado;

    // Mensaje o error
    private String mensaje;

    // Momento en que se registró la migración (insertado por n8n)
    private Instant fechaRegistro;
}
