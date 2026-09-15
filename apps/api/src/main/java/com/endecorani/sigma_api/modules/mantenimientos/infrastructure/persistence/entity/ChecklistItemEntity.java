package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
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
@Entity
@Table(
        schema = "mantenimientos",
        name = "checklist_items",
        indexes = {
                @Index(
                        name = "idx_checklist_items_actividad",
                        columnList = "actividad_mantenimiento_id"
                )
        }
)
public class ChecklistItemEntity extends BaseEntity {

    @Column(
            name = "actividad_mantenimiento_id",
            nullable = false
    )
    private UUID actividadMantenimientoId;

    @Column(
            name = "nombre",
            nullable = false,
            length = 200
    )
    private String nombre;

    @Column(
            name = "descripcion",
            length = 500
    )
    private String descripcion;

    @Column(
            name = "orden",
            nullable = false
    )
    @Builder.Default
    private Integer orden = 0;

    @Column(
            name = "obligatorio",
            nullable = false
    )
    @Builder.Default
    private Boolean obligatorio = false;
}
