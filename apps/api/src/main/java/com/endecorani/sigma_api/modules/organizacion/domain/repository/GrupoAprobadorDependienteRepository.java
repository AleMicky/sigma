package com.endecorani.sigma_api.modules.organizacion.domain.repository;

import com.endecorani.sigma_api.modules.organizacion.application.dto.response.AprobadorSelectResponse;
import com.endecorani.sigma_api.modules.organizacion.domain.model.GrupoAprobadorDependiente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GrupoAprobadorDependienteRepository {

    GrupoAprobadorDependiente save(GrupoAprobadorDependiente dependiente);

    Optional<GrupoAprobadorDependiente> findById(UUID id);

    Optional<GrupoAprobadorDependiente> findByIdAndGrupoAprobadorId(UUID id, UUID grupoAprobadorId);

    Page<GrupoAprobadorDependiente> findByGrupoAprobadorId(UUID grupoAprobadorId, Pageable pageable);

    boolean existsByIdAndGrupoAprobadorId(UUID id, UUID grupoAprobadorId);

    boolean existsByGrupoAprobadorIdAndEmpleadoId(UUID grupoAprobadorId, UUID empleadoId);

    boolean existsByGrupoAprobadorIdAndEmpleadoIdAndIdNot(UUID grupoAprobadorId, UUID empleadoId, UUID id);

    void deleteById(UUID id);

    List<AprobadorSelectResponse> findAprobadoresSelectByEmpleadoId(UUID empleadoId);
}