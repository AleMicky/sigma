package com.endecorani.sigma_api.modules.parametros.domain.model;

import com.endecorani.sigma_api.modules.parametros.domain.enums.TipoUbicacion;
import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Ubicacion extends AuditableModel {

    private UUID id;

    private String codigo;

    private String nombre;

    private String descripcion;

    private TipoUbicacion tipo;

    private UUID ubicacionPadreId;

    private String direccion;

    private BigDecimal latitud;

    private BigDecimal longitud;
}
