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

@Repository
@AllArgsConstructor
public class SolicitudMantenimientoRepositoryAdapter implements SolicitudMantenimientoRepository {

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
}
