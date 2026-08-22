package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.organizacion.domain.model.GrupoAprobadorDetalle;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.GrupoAprobadorDetalleRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.GrupoAprobadorDetalleEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper.GrupoAprobadorDetallePersistenceMapper;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringGrupoAprobadorDetalleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class GrupoAprobadorDetalleRepositoryImpl implements GrupoAprobadorDetalleRepository {

    private final SpringGrupoAprobadorDetalleRepository springRepository;

    private final GrupoAprobadorDetallePersistenceMapper mapper;

    @Override
    public GrupoAprobadorDetalle save(GrupoAprobadorDetalle detalle) {
        GrupoAprobadorDetalleEntity saved = springRepository.save(mapper.toEntity(detalle));
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<GrupoAprobadorDetalle> findById(UUID id) {
        return springRepository
                .findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public Page<GrupoAprobadorDetalle> findByGrupoAprobadorId(
            UUID grupoAprobadorId,
            Pageable pageable
    ) {
        return springRepository
                .findByGrupoAprobadorId(grupoAprobadorId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }
}
