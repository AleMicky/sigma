package com.endecorani.sigma_api.modules.organizacion.domain.repository;

import com.endecorani.sigma_api.modules.organizacion.domain.model.GrupoAprobadorDependiente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface GrupoAprobadorDependienteRepository {

    GrupoAprobadorDependiente save(GrupoAprobadorDependiente dependiente);

    Optional<GrupoAprobadorDependiente> findById(UUID id);

    Page<GrupoAprobadorDependiente> findByGrupoAprobadorId(
            UUID grupoAprobadorId,
            Pageable pageable
    );

    boolean existsByGrupoAprobadorIdAndEmpleadoId(UUID grupoAprobadorId, UUID empleadoId);

    boolean existsByGrupoAprobadorIdAndEmpleadoIdAndIdNot(
            UUID grupoAprobadorId,
            UUID empleadoId,
            UUID id
    );

    void deleteById(UUID id);
}
