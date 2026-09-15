package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.CascadeType;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "activo_id", nullable = false)
        private ActivoEntity activo;

        // Clasificación
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "tipo_mantenimiento_id", nullable = false)
        private TipoMantenimientoEntity tipoMantenimiento;

        @Column(name = "tipo_fallas", length = 200)
        private String tipoFallas;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "prioridad_id", nullable = false)
        private PrioridadEntity prioridad;

        // Solicitud
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "solicitante_id", nullable = false)
        private EmpleadoEntity solicitante;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "solicitante_id", insertable = false, updatable = false)
        private VEmpleadoEntity solicitanteView;

        @Column(name = "titulo", nullable = false, length = 150)
        private String titulo;

        @Column(name = "descripcion", nullable = false, length = 2000)
        private String descripcion;

        @Column(name = "fecha_solicitud", nullable = false)
        private LocalDateTime fechaSolicitud;

        // Datos actuales del proceso
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "aprobador_id")
        private EmpleadoEntity aprobador;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "aprobador_id", insertable = false, updatable = false)
        private VEmpleadoEntity aprobadorView;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "responsable_id")
        private EmpleadoEntity responsable;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "responsable_id", insertable = false, updatable = false)
        private VEmpleadoEntity responsableView;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "supervisor_id")
        private EmpleadoEntity supervisor;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "supervisor_id", insertable = false, updatable = false)
        private VEmpleadoEntity supervisorView;

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

        @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
        @JoinColumn(name = "solicitud_mantenimiento_id")
        private List<SolicitudMantenimientoAdjuntoEntity> adjuntos = new ArrayList<>();
}
