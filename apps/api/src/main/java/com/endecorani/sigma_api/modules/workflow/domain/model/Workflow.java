package com.endecorani.sigma_api.modules.workflow.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Workflow extends AuditableModel {

    private UUID id;

    private String codigo;

    private String nombre;

    private String descripcion;

    private String modulo;

    private String processDefinitionKey;
}