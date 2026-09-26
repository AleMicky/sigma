package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicularAdjunto;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SolicitudVehicularAdjuntoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SolicitudVehicularAdjuntoEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.SolicitudVehicularAdjuntoPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringSolicitudVehicularAdjuntoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class SolicitudVehicularAdjuntoRepositoryAdapter implements SolicitudVehicularAdjuntoRepository {

    private final SpringSolicitudVehicularAdjuntoRepository springRepository;
    private final SolicitudVehicularAdjuntoPersistenceMapper mapper;

    @Override
    public Page<SolicitudVehicularAdjunto> findBySolicitudVehicularId(UUID solicitudVehicularId, Pageable pageable) {
        return springRepository.findBySolicitudVehicularId(solicitudVehicularId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public List<SolicitudVehicularAdjunto> findBySolicitudVehicularId(UUID solicitudVehicularId) {
        return springRepository.findBySolicitudVehicularId(solicitudVehicularId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<SolicitudVehicularAdjunto> findBySolicitudVehicularIdIn(List<UUID> solicitudVehicularIds) {
        return springRepository.findBySolicitudVehicularIdIn(solicitudVehicularIds).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<SolicitudVehicularAdjunto> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public SolicitudVehicularAdjunto save(SolicitudVehicularAdjunto adjunto) {
        SolicitudVehicularAdjuntoEntity entity = mapper.toEntity(adjunto);
        SolicitudVehicularAdjuntoEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public List<SolicitudVehicularAdjunto> saveAll(List<SolicitudVehicularAdjunto> adjuntos) {
        List<SolicitudVehicularAdjuntoEntity> entities = adjuntos.stream()
                .map(mapper::toEntity)
                .toList();
        return springRepository.saveAll(entities).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public void deleteBySolicitudVehicularId(UUID solicitudVehicularId) {
        springRepository.deleteBySolicitudVehicularId(solicitudVehicularId);
    }
}
