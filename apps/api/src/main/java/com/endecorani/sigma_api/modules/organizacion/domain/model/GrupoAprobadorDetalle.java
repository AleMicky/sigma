package com.endecorani.sigma_api.modules.organizacion.domain.model;

import com.endecorani.sigma_api.modules.organizacion.domain.enums.AlcanceAprobador;
import com.endecorani.sigma_api.modules.organizacion.domain.enums.TipoAprobador;
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
public class GrupoAprobadorDetalle extends AuditableModel {

    private UUID id;

    private UUID grupoAprobadorId;

    private TipoAprobador tipoAprobador;

    private UUID empleadoId;

    private UUID cargoId;

    private UUID unidadId;

    private UUID responsabilidadId;

    private AlcanceAprobador alcance;

    private Integer orden;

    private Boolean requiereAprobacion;
}
