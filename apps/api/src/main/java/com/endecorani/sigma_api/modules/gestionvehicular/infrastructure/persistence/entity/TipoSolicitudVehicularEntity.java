package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.persistence.UniqueConstraint;
import lombok.*;
import lombok.experimental.SuperBuilder;


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
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class TipoSolicitudVehicularEntity extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 500)
    private String descripcion;
}
