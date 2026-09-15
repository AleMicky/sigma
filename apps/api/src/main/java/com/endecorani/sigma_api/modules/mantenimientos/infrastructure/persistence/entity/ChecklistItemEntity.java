package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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
                        name = "idx_checklist_item_checklist",
                        columnList = "checklist_mantenimiento_id"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_checklist_item_codigo",
                        columnNames = {
                                "checklist_mantenimiento_id",
                                "codigo"
                        }
                )
        }
)
public class ChecklistItemEntity extends BaseEntity {

    @Column(
            name = "checklist_mantenimiento_id",
            nullable = false
    )
    private UUID checklistMantenimientoId;

    @Column(
            name = "codigo",
            nullable = false,
            length = 50
    )
    private String codigo;

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
            name = "tipo_dato_id",
            nullable = false
    )
    private UUID tipoDatoId;

    @Column(
            name = "orden",
            nullable = false
    )
    private Integer orden;

    @Column(
            name = "obligatorio",
            nullable = false
    )
    @Builder.Default
    private Boolean obligatorio = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(
            name = "opciones",
            columnDefinition = "jsonb"
    )
    private String opciones;
}