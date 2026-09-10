package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(schema = "mantenimientos", name = "solicitudes_mantenimiento", indexes = {
                @Index(name = "idx_solicitud_mantenimiento_activo", columnList = "activo_id"),
                @Index(name = "idx_solicitud_mantenimiento_estado", columnList = "estado"),
                @Index(name = "idx_solicitud_mantenimiento_solicitante", columnList = "solicitante_id"),
                @Index(name = "idx_solicitud_mantenimiento_responsable", columnList = "responsable_id"),
                @Index(name = "idx_solicitud_mantenimiento_fecha", columnList = "fecha_solicitud")
}, uniqueConstraints = {
                @UniqueConstraint(name = "uk_solicitud_mantenimiento_numero", columnNames = "numero")
})
public class SolicitudMantenimientoEntity extends BaseEntity {

        @Column(name = "numero", nullable = false, length = 30)
        private String numero;

        @Column(name = "activo_id", nullable = false)
        private UUID activoId;

        // Clasificación
        @Column(name = "tipo_mantenimiento_id", nullable = false)
        private UUID tipoMantenimientoId;

        @Column(name = "tipo_falla_id", nullable = false)
        private UUID tipoFallaId;

        @Column(name = "prioridad_id", nullable = false)
        private UUID prioridadId;

        // Solicitud
        @Column(name = "solicitante_id", nullable = false)
        private UUID solicitanteId;

        @Column(name = "titulo", nullable = false, length = 150)
        private String titulo;

        @Column(name = "descripcion", nullable = false, length = 2000)
        private String descripcion;

        @Column(name = "fecha_solicitud", nullable = false)
        private LocalDateTime fechaSolicitud;

        // Datos actuales del proceso
        @Column(name = "aprobador_id")
        private UUID aprobadorId;

        @Column(name = "responsable_id")
        private UUID responsableId;

        @Column(name = "supervisor_id")
        private UUID supervisorId;

        // Ejecución
        @Column(name = "fecha_inicio_mantenimiento")
        private LocalDateTime fechaInicioMantenimiento;

        @Column(name = "fecha_fin_mantenimiento")
        private LocalDateTime fechaFinMantenimiento;

        // Cierre
        @Column(name = "fecha_cierre")
        private LocalDateTime fechaCierre;

        // Flowable
        @Column(name = "process_instance_id", length = 100)
        private String processInstanceId;

        @Column(name = "estado", nullable = false, length = 50)
        private String estado;
}
