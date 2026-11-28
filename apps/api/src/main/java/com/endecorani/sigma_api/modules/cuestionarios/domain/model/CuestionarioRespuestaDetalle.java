package com.endecorani.sigma_api.modules.cuestionarios.domain.model;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.TipoPregunta;
import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CuestionarioRespuestaDetalle extends AuditableModel {

    private UUID id;
    private UUID asignacionId;
    private UUID preguntaId;
    private String preguntaEnunciadoSnapshot;
    private TipoPregunta tipoPreguntaSnapshot;
    private String valorTexto;
    private BigDecimal valorNumerico;
    private Boolean valorBooleano;
    private UUID opcionId;
    private List<UUID> opcionesIds;
    private BigDecimal puntajeObtenido;
}
