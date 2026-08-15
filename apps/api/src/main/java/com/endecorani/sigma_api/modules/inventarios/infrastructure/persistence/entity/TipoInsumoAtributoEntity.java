package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(schema = "inventarios", name = "tipo_insumo_atributos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TipoInsumoAtributoEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tipo_insumo_id", nullable = false)
    private TipoInsumoEntity tipoInsumo;

    @Column(nullable = false, length = 50)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(
            name = "tipo_dato_id",
            nullable = false
    )
    private UUID tipoDatoId;

    @Column(nullable = false)
    private Boolean requerido;

    @Column(nullable = false)
    private Integer orden;
}
