package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity;


import com.endecorani.sigma_api.modules.parametros.domain.enums.TipoUbicacion;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(schema = "parametros", uniqueConstraints = {@UniqueConstraint(name = "uk_ubicacion_codigo", columnNames = "codigo")}, name = "ubicaciones")
public class UbicacionEntity extends BaseEntity {

    @Column(nullable = false, length = 30)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 250)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoUbicacion tipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ubicacion_padre_id")
    private UbicacionEntity ubicacionPadre;

    @Column(length = 250)
    private String direccion;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitud;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitud;
}
