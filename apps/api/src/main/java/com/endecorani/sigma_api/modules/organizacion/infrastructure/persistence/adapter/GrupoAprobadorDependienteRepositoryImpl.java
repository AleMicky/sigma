package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.organizacion.application.dto.response.AprobadorSelectResponse;
import com.endecorani.sigma_api.modules.organizacion.application.dto.response.DependienteSelectResponse;
import com.endecorani.sigma_api.modules.organizacion.domain.model.GrupoAprobadorDependiente;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.GrupoAprobadorDependienteRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.GrupoAprobadorDependienteEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper.GrupoAprobadorDependientePersistenceMapper;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringGrupoAprobadorDependienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class GrupoAprobadorDependienteRepositoryImpl implements GrupoAprobadorDependienteRepository {

    private final SpringGrupoAprobadorDependienteRepository springRepository;
    private final GrupoAprobadorDependientePersistenceMapper mapper;

    @Override
    public GrupoAprobadorDependiente save(GrupoAprobadorDependiente dependiente) {
        GrupoAprobadorDependienteEntity entity = mapper.toEntity(dependiente);
        GrupoAprobadorDependienteEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<GrupoAprobadorDependiente> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<GrupoAprobadorDependiente> findByIdAndGrupoAprobadorId(UUID id, UUID grupoAprobadorId) {
        return springRepository.findByIdAndGrupoAprobadorId(id, grupoAprobadorId).map(mapper::toDomain);
    }

    @Override
    public Page<GrupoAprobadorDependiente> findByGrupoAprobadorId(UUID grupoAprobadorId, Pageable pageable) {
        return springRepository.findByGrupoAprobadorId(grupoAprobadorId, pageable).map(mapper::toDomain);
    }

    @Override
    public boolean existsByIdAndGrupoAprobadorId(UUID id, UUID grupoAprobadorId) {
        return springRepository.existsByIdAndGrupoAprobadorId(id, grupoAprobadorId);
    }

    @Override
    public boolean existsByGrupoAprobadorIdAndEmpleadoId(UUID grupoAprobadorId, UUID empleadoId) {
        return springRepository.existsByGrupoAprobadorIdAndEmpleadoId(grupoAprobadorId, empleadoId);
    }

    @Override
    public boolean existsByGrupoAprobadorIdAndEmpleadoIdAndIdNot(UUID grupoAprobadorId, UUID empleadoId, UUID id) {
        return springRepository.existsByGrupoAprobadorIdAndEmpleadoIdAndIdNot(grupoAprobadorId, empleadoId, id);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public List<AprobadorSelectResponse> findAprobadoresSelectByEmpleadoId(UUID empleadoId) {
        return springRepository.findAprobadoresSelectByEmpleadoId(empleadoId);
    }

    @Override
    public List<DependienteSelectResponse> findDependientesSelectByAprobadorId(UUID aprobadorId) {
        return springRepository.findDependientesSelectByAprobadorId(aprobadorId);
    }
}