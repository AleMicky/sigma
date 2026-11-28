package com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoCuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.entity.CuestionarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringCuestionarioRepository
        extends JpaRepository<CuestionarioEntity, UUID>, JpaSpecificationExecutor<CuestionarioEntity> {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);

    Optional<CuestionarioEntity> findFirstByModuloOrigenAndEntidadTipoAndEventoDisparadorAndEstadoAndActivoTrue(
            String moduloOrigen,
            String entidadTipo,
            String eventoDisparador,
            EstadoCuestionario estado
    );

    List<CuestionarioEntity> findByModuloOrigenAndEntidadTipoAndEventoDisparadorAndEstadoAndActivoTrueAndIdNot(
            String moduloOrigen,
            String entidadTipo,
            String eventoDisparador,
            EstadoCuestionario estado,
            UUID excludeId
    );
}
