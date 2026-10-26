package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicularEvento;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularEventoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SalidaVehicularEventoEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.SalidaVehicularEventoPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringSalidaVehicularEventoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class SalidaVehicularEventoRepositoryAdapter implements SalidaVehicularEventoRepository {

    private final SpringSalidaVehicularEventoRepository springRepository;
    private final SalidaVehicularEventoPersistenceMapper mapper;

    @Override
    public List<SalidaVehicularEvento> findBySalidaVehicularId(UUID salidaVehicularId) {
        return springRepository.findBySalidaVehicularIdOrderByFechaHoraAsc(salidaVehicularId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<SalidaVehicularEvento> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<SalidaVehicularEvento> findByIdAndSalidaVehicularId(UUID id, UUID salidaVehicularId) {
        return springRepository.findByIdAndSalidaVehicularId(id, salidaVehicularId).map(mapper::toDomain);
    }

    @Override
    public List<SalidaVehicularEvento> findBySalidaVehicularIdIn(List<UUID> salidaVehicularIds) {
        return springRepository.findBySalidaVehicularIdInOrderByFechaHoraAsc(salidaVehicularIds)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public SalidaVehicularEvento save(SalidaVehicularEvento evento) {
        SalidaVehicularEventoEntity entity = mapper.toEntity(evento);
        SalidaVehicularEventoEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }
}
