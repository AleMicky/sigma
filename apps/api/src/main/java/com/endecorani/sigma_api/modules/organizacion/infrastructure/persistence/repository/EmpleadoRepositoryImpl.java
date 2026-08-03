package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper.EmpleadoPersistenceMapper;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class EmpleadoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        Empleado,
        EmpleadoEntity,
        UUID
        >
        implements EmpleadoRepository {

    private final SpringEmpleadoRepository springRepository;

    private final EmpleadoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            EmpleadoEntity,
            UUID
            > jpaRepository() {

        return springRepository;
    }

    @Override
    protected EmpleadoEntity toEntity(Empleado domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected Empleado toDomain(EmpleadoEntity entity) {
        return mapper.toDomain(entity);
    }

    @Override
    public boolean existsByCodigoIgnoreCase(String codigo) {
        return springRepository.existsByCodigoIgnoreCase(codigo);
    }

    @Override
    public boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    ) {
        return springRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, id);
    }

    @Override
    public Page<Empleado> findByPersonaId(UUID personaId, Pageable pageable) {
        return springRepository
                .findByPersonaId(personaId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Empleado> findByAreaId(UUID areaId, Pageable pageable) {
        return springRepository
                .findByAreaId(areaId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Empleado> findByCargoId(UUID cargoId, Pageable pageable) {
        return springRepository
                .findByCargoId(cargoId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Empleado> findByAreaIdAndCargoId(
            UUID areaId,
            UUID cargoId,
            Pageable pageable
    ) {
        return springRepository
                .findByAreaIdAndCargoId(areaId, cargoId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Empleado> findByAreaIdAndPersonaId(
            UUID areaId,
            UUID personaId,
            Pageable pageable
    ) {
        return springRepository
                .findByAreaIdAndPersonaId(areaId, personaId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Empleado> findByCargoIdAndPersonaId(
            UUID cargoId,
            UUID personaId,
            Pageable pageable
    ) {
        return springRepository
                .findByCargoIdAndPersonaId(cargoId, personaId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Empleado> findByAreaIdAndCargoIdAndPersonaId(
            UUID areaId,
            UUID cargoId,
            UUID personaId,
            Pageable pageable
    ) {
        return springRepository
                .findByAreaIdAndCargoIdAndPersonaId(areaId, cargoId, personaId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Empleado> search(String query, Pageable pageable) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Empleado> searchByAreaId(
            UUID areaId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByAreaId(areaId, query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Empleado> searchByCargoId(
            UUID cargoId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByCargoId(cargoId, query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Empleado> searchByPersonaId(
            UUID personaId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByPersonaId(personaId, query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Empleado> searchByAreaIdAndCargoId(
            UUID areaId,
            UUID cargoId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByAreaIdAndCargoId(areaId, cargoId, query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Empleado> searchByAreaIdAndPersonaId(
            UUID areaId,
            UUID personaId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByAreaIdAndPersonaId(areaId, personaId, query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Empleado> searchByCargoIdAndPersonaId(
            UUID cargoId,
            UUID personaId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByCargoIdAndPersonaId(cargoId, personaId, query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Empleado> searchByAreaIdAndCargoIdAndPersonaId(
            UUID areaId,
            UUID cargoId,
            UUID personaId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByAreaIdAndCargoIdAndPersonaId(
                        areaId,
                        cargoId,
                        personaId,
                        query,
                        pageable
                )
                .map(mapper::toDomain);
    }
}