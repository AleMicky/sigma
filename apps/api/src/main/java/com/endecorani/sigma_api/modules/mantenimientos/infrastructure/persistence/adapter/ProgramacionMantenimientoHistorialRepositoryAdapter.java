package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoHistorial;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ProgramacionMantenimientoHistorialRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ProgramacionMantenimientoHistorialEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.ProgramacionMantenimientoHistorialPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringProgramacionMantenimientoHistorialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class ProgramacionMantenimientoHistorialRepositoryAdapter implements ProgramacionMantenimientoHistorialRepository {

    private final SpringProgramacionMantenimientoHistorialRepository springRepository;
    private final ProgramacionMantenimientoHistorialPersistenceMapper mapper;

    @Override
    public Optional<ProgramacionMantenimientoHistorial> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<ProgramacionMantenimientoHistorial> findByProgramacionMantenimientoId(UUID programacionMantenimientoId) {
        return springRepository.findByProgramacionMantenimientoIdOrderByFechaDisparoDesc(programacionMantenimientoId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ProgramacionMantenimientoHistorial> findFirstPendingByProgramacionMantenimientoId(UUID programacionMantenimientoId) {
        return springRepository.findFirstByProgramacionMantenimientoIdAndCompletadoFalseOrderByFechaDisparoDesc(programacionMantenimientoId)
                .map(mapper::toDomain);
    }

    @Override
    public Optional<ProgramacionMantenimientoHistorial> findBySolicitudMantenimientoId(UUID solicitudMantenimientoId) {
        return springRepository.findBySolicitudMantenimientoId(solicitudMantenimientoId).map(mapper::toDomain);
    }

    @Override
    public ProgramacionMantenimientoHistorial save(ProgramacionMantenimientoHistorial item) {
        ProgramacionMantenimientoHistorialEntity entity = mapper.toEntity(item);
        ProgramacionMantenimientoHistorialEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }
}
