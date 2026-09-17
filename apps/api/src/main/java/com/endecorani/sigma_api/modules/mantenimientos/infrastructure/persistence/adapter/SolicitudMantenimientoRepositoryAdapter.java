package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.SolicitudMantenimientoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.SolicitudMantenimientoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringSolicitudMantenimientoRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoResumenProjection;
import com.endecorani.sigma_api.modules.mantenimientos.domain.criteria.SolicitudMantenimientoSearchCriteria;

@Repository
@AllArgsConstructor
public class SolicitudMantenimientoRepositoryAdapter implements SolicitudMantenimientoRepository {
    private static final UUID NULL_UUID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    private final SpringSolicitudMantenimientoRepository springRepository;
    private final SolicitudMantenimientoPersistenceMapper mapper;

    @Override
    public Page<SolicitudMantenimiento> findAll(Pageable pageable) {
        return springRepository.findAllWithDetails(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<SolicitudMantenimiento> search(String search, Pageable pageable) {
        return springRepository.search(search, pageable).map(mapper::toDomain);
    }

    @Override
    public Optional<SolicitudMantenimiento> findById(UUID id) {
        return springRepository.findByIdWithDetails(id).or(() -> springRepository.findById(id)).map(mapper::toDomain);
    }

    @Override
    public SolicitudMantenimiento save(SolicitudMantenimiento solicitud) {
        SolicitudMantenimientoEntity entity = mapper.toEntity(solicitud);
        SolicitudMantenimientoEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsByNumeroIgnoreCase(String numero) {
        return springRepository.existsByNumeroIgnoreCase(numero);
    }

    @Override
    public boolean existsByNumeroIgnoreCaseAndIdNot(String numero, UUID id) {
        return springRepository.existsByNumeroIgnoreCaseAndIdNot(numero, id);
    }

    @Override
    public SolicitudMantenimientoResumenProjection obtenerResumen(UUID solicitanteId, UUID aprobadorId, UUID supervisorId, UUID responsableId) {
        return springRepository.obtenerResumen(
            solicitanteId != null, 
            solicitanteId != null ? solicitanteId : NULL_UUID,
            aprobadorId != null,
            aprobadorId != null ? aprobadorId : NULL_UUID,
            supervisorId != null,
            supervisorId != null ? supervisorId : NULL_UUID,
            responsableId != null,
            responsableId != null ? responsableId : NULL_UUID
        );
    }

    private static final java.util.List<String> DUMMY_ESTADOS = java.util.List.of("__NONE__");

    @Override
    public Page<SolicitudMantenimiento> findAll(SolicitudMantenimientoSearchCriteria criteria, Pageable pageable) {
        boolean hasEstados = criteria.estados() != null && !criteria.estados().isEmpty();
        java.util.Collection<String> estados = hasEstados ? criteria.estados() : DUMMY_ESTADOS;

        return springRepository.searchWithCriteria(
                hasText(criteria.q()), textOrEmpty(criteria.q()),
                hasEstados, estados,
                hasId(criteria.solicitanteId()), idOrDefault(criteria.solicitanteId()),
                hasId(criteria.responsableId()), idOrDefault(criteria.responsableId()),
                hasId(criteria.supervisorId()), idOrDefault(criteria.supervisorId()),
                hasId(criteria.activoId()), idOrDefault(criteria.activoId()),
                hasId(criteria.aprobadorId()), idOrDefault(criteria.aprobadorId()),
                pageable
        ).map(mapper::toDomain);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String textOrEmpty(String value) {
        return value != null ? value : "";
    }

    private boolean hasId(UUID id) {
        return id != null;
    }

    private UUID idOrDefault(UUID id) {
        return id != null ? id : NULL_UUID;
    }
}
