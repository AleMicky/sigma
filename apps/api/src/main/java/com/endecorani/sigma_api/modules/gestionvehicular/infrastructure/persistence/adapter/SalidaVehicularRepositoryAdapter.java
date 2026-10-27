package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SalidaVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.SalidaVehicularPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringSalidaVehicularRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class SalidaVehicularRepositoryAdapter implements SalidaVehicularRepository {

    private final SpringSalidaVehicularRepository springRepository;
    private final SalidaVehicularPersistenceMapper mapper;

    @Override
    public Optional<SalidaVehicular> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<SalidaVehicular> findByNumero(String numero) {
        return springRepository.findByNumero(numero).map(mapper::toDomain);
    }

    @Override
    public Optional<SalidaVehicular> findByProcessInstanceId(String processInstanceId) {
        return springRepository.findByProcessInstanceId(processInstanceId).map(mapper::toDomain);
    }

    @Override
    public Page<SalidaVehicular> searchWithFilters(
            String search,
            UUID activoId,
            UUID empleadoId,
            String estado,
            Instant fechaDesde,
            Instant fechaHasta,
            Pageable pageable
    ) {
        return springRepository.searchWithFilters(search, activoId, empleadoId, estado, fechaDesde, fechaHasta, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public List<SalidaVehicular> findForReporte(
            String search,
            UUID activoId,
            UUID empleadoId,
            String estado,
            Instant fechaDesde,
            Instant fechaHasta
    ) {
        return springRepository.findForReporte(search, activoId, empleadoId, estado, fechaDesde, fechaHasta)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<SalidaVehicular> findActivas() {
        return springRepository.findActivas().stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Page<SalidaVehicular> findByEmpleadoId(UUID empleadoId, Pageable pageable) {
        return springRepository.findByEmpleadoIdOrderByCreatedAtDesc(empleadoId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public List<SalidaVehicular> findByEmpleadoId(UUID empleadoId) {
        return springRepository.findByEmpleadoIdOrderByCreatedAtDesc(empleadoId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<SalidaVehicular> findByActivoId(UUID activoId) {
        return springRepository.findByActivoIdOrderByCreatedAtDesc(activoId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public SalidaVehicular save(SalidaVehicular salidaVehicular) {
        SalidaVehicularEntity entity;
        if (salidaVehicular.getId() != null) {
            Optional<SalidaVehicularEntity> existing = springRepository.findById(salidaVehicular.getId());
            if (existing.isPresent()) {
                entity = existing.get();
                mapper.updateEntity(salidaVehicular, entity);
                SalidaVehicularEntity saved = springRepository.save(entity);
                return mapper.toDomain(saved);
            }
        }
        entity = mapper.toEntity(salidaVehicular);
        SalidaVehicularEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsById(UUID id) {
        return springRepository.existsById(id);
    }
}
