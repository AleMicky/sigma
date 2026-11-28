package com.endecorani.sigma_api.modules.cuestionarios.domain.model;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.TipoPregunta;
import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CuestionarioPregunta extends AuditableModel {

    private UUID id;
    private UUID cuestionarioId;
    private String seccion;
    private Integer orden;
    private String enunciado;
    private String descripcionAyuda;
    private TipoPregunta tipoPregunta;

    @Builder.Default
    private Boolean obligatoria = true;

    @Builder.Default
    private BigDecimal peso = BigDecimal.ONE;

    private Map<String, Object> configJson;

    @Builder.Default
    private Boolean activo = true;

    @Builder.Default
    private List<CuestionarioPreguntaOpcion> opciones = new ArrayList<>();
}
