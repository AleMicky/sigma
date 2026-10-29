package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.CargaCombustible;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.CargaCombustibleRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.CargaCombustiblePersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringCargaCombustibleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class CargaCombustibleRepositoryAdapter implements CargaCombustibleRepository {

    private final SpringCargaCombustibleRepository springRepository;
    private final CargaCombustiblePersistenceMapper mapper;

    @Override
    public Page<CargaCombustible> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<CargaCombustible> searchWithFilters(
            String search,
            UUID activoId,
            UUID viajeVehicularId,
            UUID salidaVehicularId,
            UUID insumoId,
            UUID empleadoId,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta,
            Pageable pageable
    ) {
        return springRepository.searchWithFilters(
                search,
                activoId,
                viajeVehicularId,
                salidaVehicularId,
                insumoId,
                empleadoId,
                fechaDesde,
                fechaHasta,
                pageable
        ).map(mapper::toDomain);
    }

    @Override
    public List<CargaCombustible> findForExport(
            String search,
            UUID activoId,
            UUID viajeVehicularId,
            UUID salidaVehicularId,
            UUID insumoId,
            UUID empleadoId,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta
    ) {
        return springRepository.findForExport(
                search,
                activoId,
                viajeVehicularId,
                salidaVehicularId,
                insumoId,
                empleadoId,
                fechaDesde,
                fechaHasta
        ).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<CargaCombustible> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<CargaCombustible> findByActivoId(UUID activoId) {
        return springRepository.findByActivoIdOrderByFechaCargaDesc(activoId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<CargaCombustible> findByViajeVehicularId(UUID viajeVehicularId) {
        return springRepository.findByViajeVehicularIdOrderByFechaCargaDesc(viajeVehicularId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<CargaCombustible> findBySalidaVehicularId(UUID salidaVehicularId) {
        return springRepository.findBySalidaVehicularIdOrderByFechaCargaDesc(salidaVehicularId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<CargaCombustible> findAllById(Collection<UUID> ids) {
        return springRepository.findAllById(ids).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public CargaCombustible save(CargaCombustible cargaCombustible) {
        return mapper.toDomain(springRepository.save(mapper.toEntity(cargaCombustible)));
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
