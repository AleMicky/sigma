package com.endecorani.sigma_api.modules.workflow.infrastructure.persistence;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        schema = "workflow",
        name = "workflows",
        indexes = {
                @Index(
                        name = "idx_workflow_modulo",
                        columnList = "modulo"
                ),
                @Index(
                        name = "idx_workflow_process_definition_key",
                        columnList = "process_definition_key"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_workflow_codigo",
                        columnNames = "codigo"
                )
        }
)
public class WorkflowEntity extends BaseEntity {

    @Column(
            name = "codigo",
            nullable = false,
            length = 80
    )
    private String codigo;

    @Column(
            name = "nombre",
            nullable = false,
            length = 150
    )
    private String nombre;

    @Column(
            name = "descripcion",
            length = 500
    )
    private String descripcion;

    @Column(
            name = "modulo",
            nullable = false,
            length = 80
    )
    private String modulo;

    @Column(
            name = "process_definition_key",
            nullable = false,
            length = 150
    )
    private String processDefinitionKey;
}