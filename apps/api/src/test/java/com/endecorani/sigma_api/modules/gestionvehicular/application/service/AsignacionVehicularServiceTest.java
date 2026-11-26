package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.request.AsignacionVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.AsignacionVehicularMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoLicenciaConductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.Conductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.AsignacionVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ConductorRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorLicenciaEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringConductorLicenciaRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** REQ-VEH-011: asignar conductor sin licencia VIGENTE vigente a la fecha de salida → 409. */
@ExtendWith(MockitoExtension.class)
class AsignacionVehicularServiceTest {

    @Mock
    private AsignacionVehicularRepository repository;
    @Mock
    private SolicitudVehicularRepository solicitudVehicularRepository;
    @Mock
    private SpringActivoRepository springActivoRepository;
    @Mock
    private ConductorRepository conductorRepository;
    @Mock
    private SpringConductorLicenciaRepository conductorLicenciaRepository;
    @Mock
    private EmpleadoRepository empleadoRepository;
    @Mock
    private SpringVEmpleadoRepository springVEmpleadoRepository;
    @Mock
    private AsignacionVehicularMapper mapper;

    @InjectMocks
    private AsignacionVehicularService service;

    @Test
    void create_cuandoLicenciaEstaVencidaEnLaFechaDeSalida_debeLanzar409SinGuardar() {
        UUID solicitudId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        UUID conductorId = UUID.randomUUID();
        UUID asignadoPorId = UUID.randomUUID();
        LocalDateTime fechaAsignacion = LocalDateTime.of(2026, 11, 26, 10, 0);
        LocalDateTime fechaSalida = LocalDateTime.of(2026, 12, 1, 8, 0);

        when(solicitudVehicularRepository.findById(solicitudId)).thenReturn(Optional.of(
                SolicitudVehicular.builder().id(solicitudId).fechaSalida(fechaSalida).build()));
        when(springActivoRepository.findById(activoId)).thenReturn(Optional.of(mock(ActivoEntity.class)));
        when(conductorRepository.findById(conductorId)).thenReturn(Optional.of(mock(Conductor.class)));
        when(empleadoRepository.findById(asignadoPorId)).thenReturn(Optional.of(mock(Empleado.class)));
        when(conductorLicenciaRepository.findByConductorId(conductorId)).thenReturn(List.of(
                ConductorLicenciaEntity.builder()
                        .conductorId(conductorId)
                        .estado(EstadoLicenciaConductor.VIGENTE)
                        .fechaEmision(LocalDate.of(2025, 1, 1))
                        .fechaVencimiento(LocalDate.of(2026, 11, 25))
                        .activo(true)
                        .build()));

        AsignacionVehicularRequest request = new AsignacionVehicularRequest(
                solicitudId, activoId, conductorId, asignadoPorId, fechaAsignacion, null);

        ConflictException ex = assertThrows(ConflictException.class, () -> service.create(request));

        assertEquals("CONDUCTOR_SIN_LICENCIA_VIGENTE", ex.getCode());
        verify(repository, never()).save(any());
    }
}
