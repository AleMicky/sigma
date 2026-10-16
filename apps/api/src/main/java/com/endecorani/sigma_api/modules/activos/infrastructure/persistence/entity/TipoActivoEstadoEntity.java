package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity;


import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
        name = "tipos_activo_estados",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_tipo_activo_estado",
                        columnNames = {
                                "tipo_activo_id",
                                "estado_operativo_id"
                        }
                )
        }
)
public class TipoActivoEstadoEntity extends BaseEntity {

    @Column(
            name = "tipo_activo_id",
            nullable = false
    )
    private UUID tipoActivoId;

    @Column(
            name = "estado_operativo_id",
            nullable = false
    )
    private UUID estadoOperativoId;

    @Column(
            name = "predeterminado",
            nullable = false
    )
    private Boolean predeterminado = false;
}