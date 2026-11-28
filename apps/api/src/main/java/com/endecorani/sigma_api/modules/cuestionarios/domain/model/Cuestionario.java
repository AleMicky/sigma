package com.endecorani.sigma_api.modules.cuestionarios.domain.model;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoCuestionario;
import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
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
public class Cuestionario extends AuditableModel {

    private UUID id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String moduloOrigen;
    private String entidadTipo;
    private String eventoDisparador;

    @Builder.Default
    private Integer version = 1;

    @Builder.Default
    private EstadoCuestionario estado = EstadoCuestionario.BORRADOR;

    @Builder.Default
    private Boolean obligatorio = false;

    @Builder.Default
    private Boolean anonimoEnReportes = false;

    @Builder.Default
    private Boolean activo = true;
}
