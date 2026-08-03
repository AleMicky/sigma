package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(schema = "activos", name = "activo_atributos")
public class ActivoAtributoEntity extends BaseEntity {

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
            name = "etiqueta",
            nullable = false,
            length = 100
    )
    private String etiqueta;

    @Column(
            name = "descripcion",
            length = 255
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
    private Integer orden = 0;

    @Column(
            name = "requerido",
            nullable = false
    )
    private Boolean requerido = false;

    @Column(
            name = "visible",
            nullable = false
    )
    private Boolean visible = true;

    @Column(
            name = "editable",
            nullable = false
    )
    private Boolean editable = true;

    @Column(
            name = "valor_defecto",
            length = 255
    )
    private String valorDefecto;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(
            name = "opciones",
            columnDefinition = "jsonb"
    )
    private String opciones;
}
