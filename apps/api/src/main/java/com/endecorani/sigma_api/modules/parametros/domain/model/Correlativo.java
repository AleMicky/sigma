package com.endecorani.sigma_api.modules.parametros.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Correlativo {

    private UUID id;

    private String codigo;

    private Integer gestion;

    private Integer ultimoNumero;

    private String prefijo;

    private Integer longitud;

}