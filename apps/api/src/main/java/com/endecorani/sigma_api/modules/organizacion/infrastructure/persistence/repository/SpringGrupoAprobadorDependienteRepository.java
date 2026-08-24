package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.organizacion.application.dto.response.AprobadorSelectResponse;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.GrupoAprobadorDependienteEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringGrupoAprobadorDependienteRepository
        extends JpaRepository<GrupoAprobadorDependienteEntity, UUID> {

    Optional<GrupoAprobadorDependienteEntity> findByIdAndGrupoAprobadorId(UUID id, UUID grupoAprobadorId);

    Page<GrupoAprobadorDependienteEntity> findByGrupoAprobadorId(
            UUID grupoAprobadorId,
            Pageable pageable
    );

    boolean existsByGrupoAprobadorIdAndEmpleadoId(UUID grupoAprobadorId, UUID empleadoId);

    boolean existsByGrupoAprobadorIdAndEmpleadoIdAndIdNot(
            UUID grupoAprobadorId,
            UUID empleadoId,
            UUID id
    );

    boolean existsByIdAndGrupoAprobadorId(UUID id, UUID grupoAprobadorId);

    @Query("""
        SELECT DISTINCT new com.endecorani.sigma_api.modules.organizacion.application.dto.response.AprobadorSelectResponse(
            e.id,
            TRIM(CONCAT(COALESCE(p.nombres, ''), ' ', COALESCE(p.primerApellido, ''), ' ', COALESCE(p.segundoApellido, ''))),
            c.nombre
        )
        FROM EmpleadoEntity e
        JOIN PersonaEntity p ON p.id = e.personaId
        JOIN CargoEntity c ON c.id = e.cargoId
        WHERE e.activo = true
          AND (
              e.id IN (
                  SELECT d.empleadoId
                  FROM GrupoAprobadorDetalleEntity d
                  WHERE d.grupoAprobadorId IN (
                      SELECT dep.grupoAprobadorId
                      FROM GrupoAprobadorDependienteEntity dep
                      WHERE dep.empleadoId = :empleadoId
                  )
                  AND d.tipoAprobador = 'EMPLEADO'
              )
              OR e.cargoId IN (
                  SELECT d.cargoId
                  FROM GrupoAprobadorDetalleEntity d
                  WHERE d.grupoAprobadorId IN (
                      SELECT dep.grupoAprobadorId
                      FROM GrupoAprobadorDependienteEntity dep
                      WHERE dep.empleadoId = :empleadoId
                  )
                  AND d.tipoAprobador = 'CARGO'
              )
          )
    """)
    List<AprobadorSelectResponse> findAprobadoresSelectByEmpleadoId(@Param("empleadoId") UUID empleadoId);
}