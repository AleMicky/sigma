package com.endecorani.sigma_api.modules.gestionvehicular.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Conductor extends AuditableModel {
    private UUID id;
    private UUID empleadoId;
    private String numeroLicencia;
    private String categoriaLicencia;
    private LocalDate fechaVencimiento;
    @Builder.Default
    private boolean activo = true;
}