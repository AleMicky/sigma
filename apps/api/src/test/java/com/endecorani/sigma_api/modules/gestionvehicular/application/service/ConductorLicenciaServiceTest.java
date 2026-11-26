package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request.ConductorLicenciaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.ConductorMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoLicenciaConductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.Conductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ConductorRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorLicenciaEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.ConductorPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringConductorLicenciaRepository;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.util.FlexibleLocalDateTimeParser;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** REQ-VEH-011: creación/actualización de licencias con fechas inválidas o vencidas → 422. */
@ExtendWith(MockitoExtension.class)
class ConductorLicenciaServiceTest {

    @Mock
    private SpringConductorLicenciaRepository licenciaRepository;
    @Mock
    private ConductorRepository conductorRepository;
    @Mock
    private ConductorPersistenceMapper persistenceMapper;
    @Mock
    private ConductorMapper mapper;
    @Mock
    private DocumentStorageService documentStorageService;

    @InjectMocks
    private ConductorLicenciaService service;

    @Test
    void create_cuandoFechaEmisionPosteriorAlVencimiento_debeLanzar422SinGuardar() {
        UUID conductorId = UUID.randomUUID();
        when(conductorRepository.findById(conductorId)).thenReturn(Optional.of(mock(Conductor.class)));

        LocalDate hoy = LocalDate.now(FlexibleLocalDateTimeParser.OPERATIONAL_ZONE);
        BusinessException ex = assertThrows(BusinessException.class, () -> service.create(
                conductorId,
                request(hoy.plusDays(1), hoy.minusDays(30)),
                null
        ));

        assertEquals("LICENCIA_FECHAS_INVALIDAS", ex.getCode());
        verifyNoInteractions(licenciaRepository, documentStorageService);
    }

    @Test
    void create_cuandoLicenciaVencida_debeLanzar422SinGuardar() {
        UUID conductorId = UUID.randomUUID();
        when(conductorRepository.findById(conductorId)).thenReturn(Optional.of(mock(Conductor.class)));

        LocalDate hoy = LocalDate.now(FlexibleLocalDateTimeParser.OPERATIONAL_ZONE);
        BusinessException ex = assertThrows(BusinessException.class, () -> service.create(
                conductorId,
                request(hoy.minusDays(400), hoy.minusDays(1)),
                null
        ));

        assertEquals("LICENCIA_VENCIDA", ex.getCode());
        verifyNoInteractions(licenciaRepository, documentStorageService);
    }

    @Test
    void update_cuandoLicenciaVencida_debeLanzar422SinGuardar() {
        UUID licenciaId = UUID.randomUUID();
        UUID conductorId = UUID.randomUUID();
        when(licenciaRepository.findById(licenciaId)).thenReturn(Optional.of(ConductorLicenciaEntity.builder()
                .id(licenciaId)
                .conductorId(conductorId)
                .estado(EstadoLicenciaConductor.VIGENTE)
                .build()));

        LocalDate hoy = LocalDate.now(FlexibleLocalDateTimeParser.OPERATIONAL_ZONE);
        BusinessException ex = assertThrows(BusinessException.class, () -> service.update(
                licenciaId,
                request(hoy.minusDays(300), hoy.minusDays(1)),
                null
        ));

        assertEquals("LICENCIA_VENCIDA", ex.getCode());
        org.mockito.Mockito.verify(licenciaRepository, org.mockito.Mockito.never()).save(any());
    }

    private ConductorLicenciaRequest request(LocalDate emision, LocalDate vencimiento) {
        return new ConductorLicenciaRequest(
                null,
                "B2",
                "123456789",
                emision,
                vencimiento,
                EstadoLicenciaConductor.VIGENTE,
                null,
                null,
                null,
                null,
                null,
                null,
                true
        );
    }
}
