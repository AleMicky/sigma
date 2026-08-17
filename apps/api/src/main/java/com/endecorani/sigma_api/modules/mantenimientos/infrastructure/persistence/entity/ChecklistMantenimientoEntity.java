package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;


@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        schema = "mantenimientos",
        name = "checklists_mantenimiento",
        indexes = {
                @Index(
                        name = "idx_checklist_actividad",
                        columnList = "actividad_mantenimiento_id"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_checklist_mantenimiento_codigo",
                        columnNames = "codigo"
                )
        }
)
public class ChecklistMantenimientoEntity extends BaseEntity {
    @Column(
            name = "actividad_mantenimiento_id",
            nullable = false
    )
    private UUID actividadMantenimientoId;

    @Column(
            name = "codigo",
            nullable = false,
            length = 50
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
}
