package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.criteria.SolicitudMantenimientoSearchCriteria;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.SolicitudMantenimientoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.SolicitudMantenimientoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringSolicitudMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.specification.SolicitudMantenimientoSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class SolicitudMantenimientoRepositoryImpl
        implements SolicitudMantenimientoRepository {

    private final SpringSolicitudMantenimientoRepository springRepository;
    private final SolicitudMantenimientoPersistenceMapper mapper;

    @Override
    public SolicitudMantenimiento save(SolicitudMantenimiento domain) {
        SolicitudMantenimientoEntity entity = mapper.toEntity(domain);
        return mapper.toDomain(springRepository.save(entity));
    }

    @Override
    public Optional<SolicitudMantenimiento> findById(UUID id) {
        return springRepository
                .findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public List<SolicitudMantenimiento> findAll() {
        return springRepository
                .findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Page<SolicitudMantenimiento> findAll(Pageable pageable) {
        return springRepository
                .findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<SolicitudMantenimiento> findAll(
            SolicitudMantenimientoSearchCriteria criteria,
            Pageable pageable
    ) {
        return springRepository
                .findAll(SolicitudMantenimientoSpecifications.withCriteria(criteria), pageable)
                .map(mapper::toDomain);
    }

    @Override
    public boolean existsById(UUID id) {
        return springRepository.existsById(id);
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
    public boolean existsByNumeroIgnoreCaseAndIdNot(
            String numero,
            UUID id
    ) {
        return springRepository
                .existsByNumeroIgnoreCaseAndIdNot(numero, id);
    }

    @Override
    public Page<SolicitudMantenimiento> findByActivoId(
            UUID activoId,
            Pageable pageable
    ) {
        return springRepository
                .findByActivoId(activoId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<SolicitudMantenimiento> findByEstado(
            String estado,
            Pageable pageable
    ) {
        return springRepository
                .findByEstadoIgnoreCase(estado, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<SolicitudMantenimiento> findBySolicitanteId(
            UUID solicitanteId,
            Pageable pageable
    ) {
        return springRepository
                .findBySolicitanteId(solicitanteId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<SolicitudMantenimiento> findByResponsableId(
            UUID responsableId,
            Pageable pageable
    ) {
        return springRepository
                .findByResponsableId(responsableId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<SolicitudMantenimiento> search(
            String query,
            Pageable pageable
    ) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }
}
