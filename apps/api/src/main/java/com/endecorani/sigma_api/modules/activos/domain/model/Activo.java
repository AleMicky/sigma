package com.endecorani.sigma_api.modules.activos.domain.model;

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
public class Activo extends AuditableModel {

    private UUID id;

    private String codigo;

    private String nombre;

    private String descripcion;

    private UUID tipoActivoId;

    private UUID ubicacionId;

    private LocalDate fechaAdquisicion;

    private String urlImagen;
}
