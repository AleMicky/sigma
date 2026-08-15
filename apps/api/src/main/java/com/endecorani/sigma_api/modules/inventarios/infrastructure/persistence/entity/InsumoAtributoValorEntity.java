package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        schema = "inventarios",
        name = "insumo_atributo_valores",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_insumo_atributo",
                        columnNames = {"insumo_id", "tipo_insumo_atributo_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsumoAtributoValorEntity  extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "insumo_id", nullable = false)
    private InsumoEntity insumo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tipo_insumo_atributo_id", nullable = false)
    private TipoInsumoAtributoEntity atributo;

    @Column(nullable = false, length = 500)
    private String valor;
}
