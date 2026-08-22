package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.organizacion.domain.enums.AlcanceAprobador;
import com.endecorani.sigma_api.modules.organizacion.domain.enums.TipoAprobador;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;


@Entity
@Table(schema = "organizacion", name = "grupos_aprobadores_detalles", indexes = {@Index(name = "idx_grupo_aprobador_detalle_grupo", columnList = "grupo_aprobador_id")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrupoAprobadorDetalleEntity extends BaseEntity {

    @Column(name = "grupo_aprobador_id", nullable = false)
    private UUID grupoAprobadorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_aprobador", nullable = false, length = 30)
    private TipoAprobador tipoAprobador;

    @Column(name = "empleado_id")
    private UUID empleadoId;

    @Column(name = "cargo_id")
    private UUID cargoId;

    @Column(name = "responsabilidad_id")
    private UUID responsabilidadId;

    @Enumerated(EnumType.STRING)
    @Column(name = "alcance", nullable = false, length = 40)
    private AlcanceAprobador alcance;

    @Column(nullable = false)
    private Integer orden;

    @Column(name = "requiere_aprobacion", nullable = false)
    private Boolean requiereAprobacion;

}
