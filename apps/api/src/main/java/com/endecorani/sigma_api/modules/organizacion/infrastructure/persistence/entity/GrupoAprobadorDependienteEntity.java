package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
        schema = "organizacion",
        name = "grupos_aprobadores_dependientes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_grupo_aprobador_dependiente",
                        columnNames = {
                                "grupo_aprobador_id",
                                "empleado_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_grupo_aprobador_dependiente_empleado",
                        columnList = "empleado_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrupoAprobadorDependienteEntity extends BaseEntity {

    @Column(name = "grupo_aprobador_id", nullable = false)
    private UUID grupoAprobadorId;

    @Column(name = "empleado_id", nullable = false)
    private UUID empleadoId;
}