package com.endecorani.sigma_api.modules.activos.domain.model;


import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ActivoAtributo extends AuditableModel {

    private UUID id;

    private UUID tipoActivoId;

    @Builder.Default
    private boolean activo = true;
}
