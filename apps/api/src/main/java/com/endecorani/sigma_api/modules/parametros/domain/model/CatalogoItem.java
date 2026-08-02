package com.endecorani.sigma_api.modules.parametros.domain.model;

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
public class CatalogoItem extends AuditableModel {
    private UUID id;

    private UUID catalogoId;

    private String nombre;

    private String valor;

    private Integer orden;

}
