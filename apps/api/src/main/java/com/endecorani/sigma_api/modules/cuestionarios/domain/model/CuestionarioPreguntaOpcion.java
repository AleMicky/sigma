package com.endecorani.sigma_api.modules.cuestionarios.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CuestionarioPreguntaOpcion extends AuditableModel {

    private UUID id;
    private UUID preguntaId;
    private Integer orden;
    private String etiqueta;
    private String valor;

    @Builder.Default
    private BigDecimal puntaje = BigDecimal.ZERO;

    @Builder.Default
    private Boolean activo = true;
}
