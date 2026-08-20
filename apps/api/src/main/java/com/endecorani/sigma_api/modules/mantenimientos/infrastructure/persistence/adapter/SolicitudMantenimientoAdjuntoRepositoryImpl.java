package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimientoAdjunto;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoAdjuntoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.SolicitudMantenimientoAdjuntoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.SolicitudMantenimientoAdjuntoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringSolicitudMantenimientoAdjuntoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class SolicitudMantenimientoAdjuntoRepositoryImpl
        implements SolicitudMantenimientoAdjuntoRepository {

    private final SpringSolicitudMantenimientoAdjuntoRepository
            springRepository;
    private final SolicitudMantenimientoAdjuntoPersistenceMapper
            mapper;

    @Override
    public SolicitudMantenimientoAdjunto save(
            SolicitudMantenimientoAdjunto domain
    ) {
        SolicitudMantenimientoAdjuntoEntity entity =
                mapper.toEntity(domain);
        return mapper.toDomain(springRepository.save(entity));
    }

    @Override
    public Optional<SolicitudMantenimientoAdjunto> findById(
            UUID id
    ) {
        return springRepository
                .findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public Page<SolicitudMantenimientoAdjunto>
    findBySolicitudMantenimientoId(
            UUID solicitudMantenimientoId,
            Pageable pageable
    ) {
        return springRepository
                .findBySolicitudMantenimientoId(
                        solicitudMantenimientoId,
                        pageable
                )
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
}
