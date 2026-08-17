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
                        name = "idx_accesorios_categoria_id",
                        columnList = "categoria_id"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_accesorios_categoria_codigo_ci",
                        columnNames = {"categoria_id", "codigo"}
                )
        }
)
public class AccesorioEntity extends BaseEntity {

    @Column(
            name = "categoria_id",
            nullable = false
    )
    private UUID categoriaId;

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