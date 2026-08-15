package com.endecorani.sigma_api.modules.inventarios.domain.model;

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
public class InsumoAtributoValor extends AuditableModel {

    private UUID id;

    private UUID insumoId;

    private UUID tipoInsumoAtributoId;

    private String valor;
}
