package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.BitacoraVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.BitacoraVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.BitacoraVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.BitacoraVehicularPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringBitacoraVehicularRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class BitacoraVehicularRepositoryAdapter implements BitacoraVehicularRepository {

    private final SpringBitacoraVehicularRepository springRepository;
    private final BitacoraVehicularPersistenceMapper mapper;

    @Override
    public List<BitacoraVehicular> findBySalidaVehicularId(UUID salidaVehicularId) {
        return springRepository.findBySalidaVehicularIdOrderByFechaHoraDesc(salidaVehicularId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<BitacoraVehicular> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<BitacoraVehicular> findByIdAndSalidaVehicularId(UUID id, UUID salidaVehicularId) {
        return springRepository.findByIdAndSalidaVehicularId(id, salidaVehicularId).map(mapper::toDomain);
    }

    @Override
    public List<BitacoraVehicular> findConFiltros(
            UUID salidaVehicularId,
            UUID empleadoId,
            String tipo,
            Instant fechaDesde,
            Instant fechaHasta
    ) {
        return springRepository.findBitacorasConFiltros(salidaVehicularId, empleadoId, tipo, fechaDesde, fechaHasta)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public BitacoraVehicular save(BitacoraVehicular bitacora) {
        BitacoraVehicularEntity entity = mapper.toEntity(bitacora);
        BitacoraVehicularEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }
}
