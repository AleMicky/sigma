package com.endecorani.sigma_api.modules.mantenimientos.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ProgramacionMantenimiento extends AuditableModel {
    private UUID id;
    private UUID planMantenimientoActivoId;

    @Builder.Default
    private Boolean activo = true;

    @Builder.Default
    private List<ProgramacionMantenimientoCriterio> criterios = new ArrayList<>();
}
