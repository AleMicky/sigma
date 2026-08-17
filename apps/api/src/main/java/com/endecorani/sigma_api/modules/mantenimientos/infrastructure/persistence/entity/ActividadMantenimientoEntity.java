package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
        schema = "mantenimientos",
        name = "actividades_mantenimiento",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_actividad_mantenimiento_codigo",
                        columnNames = "codigo"
                )
        }
)
public class ActividadMantenimientoEntity extends BaseEntity {
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

    @Column(
            name = "aplica_todos_tipos_activo",
            nullable = false
    )
    private Boolean aplicaTodosTiposActivo = false;

    @Column(
            name = "requiere_checklist",
            nullable = false
    )
    private Boolean requiereChecklist = false;

}
