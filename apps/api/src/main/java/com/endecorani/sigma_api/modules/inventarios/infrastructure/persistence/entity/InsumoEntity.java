package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.UnidadMedidaEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(schema = "inventarios", name = "insumos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsumoEntity extends BaseEntity {

    @Column(nullable = false, unique = true, length = 30)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 500)
    private String descripcion;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_insumo_id", nullable = false)
    private CategoriaInsumoEntity categoriaInsumo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unidad_medida_id", nullable = false)
    private UnidadMedidaEntity unidadMedida;

    @Column(length = 100)
    private String marca;
}
