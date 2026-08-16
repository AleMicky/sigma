package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        schema = "activos",
        name = "accesorios",
        indexes = {
                @Index(
                        name = "idx_accesorio_tipo_activo",
                        columnList = "tipo_activo_id"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_accesorio_tipo_codigo",
                        columnNames = {"tipo_activo_id", "codigo"}
                )
        }
)
public class AccesorioEntity extends BaseEntity {

    @Column(
            name = "tipo_activo_id",
            nullable = false
    )
    private UUID tipoActivoId;

    @Column(
            name = "codigo",
            nullable = false,
            length = 50
    )
    private String codigo;

    @Column(
            name = "nombre",
            nullable = false,
            length = 100
    )
    private String nombre;

    @Column(
            name = "descripcion",
            length = 255
    )
    private String descripcion;
}