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
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<SolicitudMantenimiento> search(String search, Pageable pageable) {
        return springRepository.search(search, pageable).map(mapper::toDomain);
    }

    @Override
    public Optional<SolicitudMantenimiento> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
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
    public SolicitudMantenimientoResumenProjection obtenerResumen(UUID solicitanteId) {
        return springRepository.obtenerResumen(
            solicitanteId != null, 
            solicitanteId != null ? solicitanteId : NULL_UUID
        );
    }

    @Override
    public Page<SolicitudMantenimiento> findAll(SolicitudMantenimientoSearchCriteria criteria, Pageable pageable) {
        return springRepository.searchWithCriteria(
                criteria.q() != null && !criteria.q().isBlank(),
                criteria.q() != null ? criteria.q() : "",
                criteria.estado() != null && !criteria.estado().isBlank(),
                criteria.estado() != null ? criteria.estado() : "",
                criteria.solicitanteId() != null,
                criteria.solicitanteId() != null ? criteria.solicitanteId() : NULL_UUID,
                criteria.responsableId() != null,
                criteria.responsableId() != null ? criteria.responsableId() : NULL_UUID,
                criteria.supervisorId() != null,
                criteria.supervisorId() != null ? criteria.supervisorId() : NULL_UUID,
                criteria.activoId() != null,
                criteria.activoId() != null ? criteria.activoId() : NULL_UUID,
                criteria.aprobadorId() != null,
                criteria.aprobadorId() != null ? criteria.aprobadorId() : NULL_UUID,
                pageable
        ).map(mapper::toDomain);
    }
}
