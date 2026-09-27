package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoConductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.Conductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ConductorRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorLicenciaEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.ConductorPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringConductorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class ConductorRepositoryAdapter implements ConductorRepository {

    private final SpringConductorRepository springRepository;
    private final ConductorPersistenceMapper mapper;

    @Override
    public Page<Conductor> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<Conductor> search(String search, Pageable pageable) {
        return springRepository.search(search, pageable).map(mapper::toDomain);
    }

    @Override
    public Page<Conductor> searchWithFilters(String search, String categoria, EstadoConductor estado, Boolean activo, Pageable pageable) {
        return springRepository.searchWithFilters(search, categoria, estado, activo, pageable).map(mapper::toDomain);
    }

    @Override
    public List<Conductor> findDisponibles(LocalDateTime fechaSalida, LocalDateTime fechaRetorno) {
        return springRepository.findDisponibles(fechaSalida, fechaRetorno).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<Conductor> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Conductor save(Conductor domain) {
        ConductorEntity entityToSave;

        if (domain.getId() != null) {
            Optional<ConductorEntity> existingEntityOpt = springRepository.findById(domain.getId());
            if (existingEntityOpt.isPresent()) {
                ConductorEntity existingEntity = existingEntityOpt.get();
                existingEntity.setEmpleadoId(domain.getEmpleadoId());
                existingEntity.setEstado(domain.getEstado());
                existingEntity.setObservacion(domain.getObservacion());
                existingEntity.setActivo(domain.isActivo());

                if (domain.getLicencias() != null) {
                    Map<UUID, ConductorLicenciaEntity> existingLicenciasMap = existingEntity.getLicencias().stream()
                            .filter(l -> l.getId() != null)
                            .collect(Collectors.toMap(ConductorLicenciaEntity::getId, l -> l));

                    List<ConductorLicenciaEntity> updatedLicencias = new ArrayList<>();

                    for (var licDomain : domain.getLicencias()) {
                        if (licDomain.getId() != null && existingLicenciasMap.containsKey(licDomain.getId())) {
                            ConductorLicenciaEntity existingLic = existingLicenciasMap.get(licDomain.getId());
                            existingLic.setCategoriaLicencia(licDomain.getCategoriaLicencia());
                            existingLic.setNumeroLicencia(licDomain.getNumeroLicencia());
                            existingLic.setFechaEmision(licDomain.getFechaEmision());
                            existingLic.setFechaVencimiento(licDomain.getFechaVencimiento());
                            existingLic.setEstado(licDomain.getEstado());
                            existingLic.setNombreArchivo(licDomain.getNombreArchivo());
                            existingLic.setNombreOriginal(licDomain.getNombreOriginal());
                            existingLic.setUrl(licDomain.getUrl());
                            existingLic.setMimeType(licDomain.getMimeType());
                            existingLic.setSize(licDomain.getSize());
                            existingLic.setObservacion(licDomain.getObservacion());
                            existingLic.setActivo(licDomain.isActivo());
                            updatedLicencias.add(existingLic);
                        } else {
                            ConductorLicenciaEntity newLic = mapper.licenciaToEntity(licDomain);
                            updatedLicencias.add(newLic);
                        }
                    }

                    existingEntity.getLicencias().clear();
                    existingEntity.getLicencias().addAll(updatedLicencias);
                }

                entityToSave = existingEntity;
            } else {
                entityToSave = mapper.toEntity(domain);
            }
        } else {
            entityToSave = mapper.toEntity(domain);
        }

        ConductorEntity savedEntity = springRepository.save(entityToSave);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsByEmpleadoId(UUID empleadoId) {
        return springRepository.existsByEmpleadoId(empleadoId);
    }

    @Override
    public boolean existsByEmpleadoIdAndIdNot(UUID empleadoId, UUID id) {
        return springRepository.existsByEmpleadoIdAndIdNot(empleadoId, id);
    }
}
