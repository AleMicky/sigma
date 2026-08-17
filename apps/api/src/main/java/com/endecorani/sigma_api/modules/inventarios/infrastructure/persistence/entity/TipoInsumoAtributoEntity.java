package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(schema = "inventarios", name = "tipo_insumo_atributos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TipoInsumoAtributoEntity extends BaseEntity {

    @Column(
            name = "tipo_dato_id",
            nullable = false
    )
    private UUID tipoDatoId;

    @Column(
            name = "tipo_insumo_id",
            nullable = false
    )
    private UUID tipoInsumoId;

    @Column(nullable = false, length = 50)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false)
    private Boolean requerido;

    @Column(nullable = false)
    private Integer orden;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(
            name = "opciones",
            columnDefinition = "jsonb"
    )
    private String opciones;
}
