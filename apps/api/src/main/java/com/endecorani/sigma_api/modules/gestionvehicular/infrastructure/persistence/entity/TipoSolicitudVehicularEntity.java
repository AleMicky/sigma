package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(
        schema = "gestion_vehicular",
        name = "tipos_solicitud_vehicular",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_tipo_solicitud_vehicular_codigo",
                        columnNames = "codigo"
                )
        }
)
public class TipoSolicitudVehicularEntity extends BaseEntity {

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
            name = "dias_anticipacion",
            nullable = false
    )
    private Integer diasAnticipacion;

    @Column(
            name = "requiere_justificacion",
            nullable = false
    )
    private Boolean requiereJustificacion;

    @Column(
            name = "requiere_respaldo",
            nullable = false
    )
    private Boolean requiereRespaldo;
}
