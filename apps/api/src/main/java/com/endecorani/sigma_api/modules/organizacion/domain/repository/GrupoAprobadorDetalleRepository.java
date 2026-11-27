package com.endecorani.sigma_api.modules.organizacion.domain.repository;

import com.endecorani.sigma_api.modules.organizacion.domain.model.GrupoAprobadorDetalle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GrupoAprobadorDetalleRepository {

    GrupoAprobadorDetalle save(GrupoAprobadorDetalle detalle);

    Optional<GrupoAprobadorDetalle> findById(UUID id);

    Page<GrupoAprobadorDetalle> findByGrupoAprobadorId(
            UUID grupoAprobadorId,
            Pageable pageable
    );

    /** REQ-MANT-008: miembros de un grupo de aprobadores por responsabilidad. */
    List<GrupoAprobadorDetalle> findByResponsabilidadId(UUID responsabilidadId);

    void deleteById(UUID id);
}
