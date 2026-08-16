package com.endecorani.sigma_api.modules.parametros.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
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
public class UnidadMedida extends AuditableModel {
    private UUID id;

    private String codigo;

    private String nombre;

    private String simbolo;

    @Builder.Default
    private Boolean permiteDecimal = false;

}
