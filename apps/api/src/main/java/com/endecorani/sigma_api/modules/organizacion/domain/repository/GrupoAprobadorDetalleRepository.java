package com.endecorani.sigma_api.modules.organizacion.domain.repository;

import com.endecorani.sigma_api.modules.organizacion.domain.model.GrupoAprobadorDetalle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface GrupoAprobadorDetalleRepository {

    GrupoAprobadorDetalle save(GrupoAprobadorDetalle detalle);

    Optional<GrupoAprobadorDetalle> findById(UUID id);

    Page<GrupoAprobadorDetalle> findByGrupoAprobadorId(
            UUID grupoAprobadorId,
            Pageable pageable
    );

    void deleteById(UUID id);
}
