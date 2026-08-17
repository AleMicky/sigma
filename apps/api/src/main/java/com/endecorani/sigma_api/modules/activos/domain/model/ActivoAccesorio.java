package com.endecorani.sigma_api.modules.activos.domain.model;

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
public class ActivoAccesorio extends AuditableModel {

    private UUID id;

    private UUID activoId;

    private UUID accesorioId;

    private Integer cantidad;

    private String numeroSerie;

    private String observacion;
}
