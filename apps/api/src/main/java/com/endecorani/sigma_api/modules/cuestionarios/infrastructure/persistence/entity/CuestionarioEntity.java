package com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoCuestionario;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(schema = "cuestionarios", name = "cuestionarios")
public class CuestionarioEntity extends BaseEntity {

    @Column(name = "codigo", nullable = false, unique = true, length = 50)
    private String codigo;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "modulo_origen", nullable = false, length = 50)
    private String moduloOrigen;

    @Column(name = "entidad_tipo", nullable = false, length = 60)
    private String entidadTipo;

    @Column(name = "evento_disparador", nullable = false, length = 60)
    private String eventoDisparador;

    @Column(name = "version", nullable = false)
    private Integer version = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoCuestionario estado = EstadoCuestionario.BORRADOR;

    @Column(name = "obligatorio", nullable = false)
    private Boolean obligatorio = false;

    @Column(name = "anonimo_en_reportes", nullable = false)
    private Boolean anonimoEnReportes = false;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}
