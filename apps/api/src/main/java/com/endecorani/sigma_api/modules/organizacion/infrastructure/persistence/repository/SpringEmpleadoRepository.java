package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringEmpleadoRepository
        extends BaseJpaRepository<
        EmpleadoEntity,
        UUID
        > {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    Page<EmpleadoEntity> findByPersonaId(UUID personaId, Pageable pageable);

    Page<EmpleadoEntity> findByAreaId(UUID areaId, Pageable pageable);

    Page<EmpleadoEntity> findByCargoId(UUID cargoId, Pageable pageable);

    Page<EmpleadoEntity> findByAreaIdAndCargoId(UUID areaId, UUID cargoId, Pageable pageable);

    Page<EmpleadoEntity> findByAreaIdAndPersonaId(UUID areaId, UUID personaId, Pageable pageable);

    Page<EmpleadoEntity> findByCargoIdAndPersonaId(UUID cargoId, UUID personaId, Pageable pageable);

    Page<EmpleadoEntity> findByAreaIdAndCargoIdAndPersonaId(
            UUID areaId,
            UUID cargoId,
            UUID personaId,
            Pageable pageable
    );

    @Query("""
            select empleado
            from EmpleadoEntity empleado
            where lower(empleado.codigo) like lower(concat('%', :query, '%'))
            """)
    Page<EmpleadoEntity> search(
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select empleado
            from EmpleadoEntity empleado
            where empleado.areaId = :areaId
              and lower(empleado.codigo) like lower(concat('%', :query, '%'))
            """)
    Page<EmpleadoEntity> searchByAreaId(
            @Param("areaId") UUID areaId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select empleado
            from EmpleadoEntity empleado
            where empleado.cargoId = :cargoId
              and lower(empleado.codigo) like lower(concat('%', :query, '%'))
            """)
    Page<EmpleadoEntity> searchByCargoId(
            @Param("cargoId") UUID cargoId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select empleado
            from EmpleadoEntity empleado
            where empleado.personaId = :personaId
              and lower(empleado.codigo) like lower(concat('%', :query, '%'))
            """)
    Page<EmpleadoEntity> searchByPersonaId(
            @Param("personaId") UUID personaId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select empleado
            from EmpleadoEntity empleado
            where empleado.areaId = :areaId
              and empleado.cargoId = :cargoId
              and lower(empleado.codigo) like lower(concat('%', :query, '%'))
            """)
    Page<EmpleadoEntity> searchByAreaIdAndCargoId(
            @Param("areaId") UUID areaId,
            @Param("cargoId") UUID cargoId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select empleado
            from EmpleadoEntity empleado
            where empleado.areaId = :areaId
              and empleado.personaId = :personaId
              and lower(empleado.codigo) like lower(concat('%', :query, '%'))
            """)
    Page<EmpleadoEntity> searchByAreaIdAndPersonaId(
            @Param("areaId") UUID areaId,
            @Param("personaId") UUID personaId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select empleado
            from EmpleadoEntity empleado
            where empleado.cargoId = :cargoId
              and empleado.personaId = :personaId
              and lower(empleado.codigo) like lower(concat('%', :query, '%'))
            """)
    Page<EmpleadoEntity> searchByCargoIdAndPersonaId(
            @Param("cargoId") UUID cargoId,
            @Param("personaId") UUID personaId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select empleado
            from EmpleadoEntity empleado
            where empleado.areaId = :areaId
              and empleado.cargoId = :cargoId
              and empleado.personaId = :personaId
              and lower(empleado.codigo) like lower(concat('%', :query, '%'))
            """)
    Page<EmpleadoEntity> searchByAreaIdAndCargoIdAndPersonaId(
            @Param("areaId") UUID areaId,
            @Param("cargoId") UUID cargoId,
            @Param("personaId") UUID personaId,
            @Param("query") String query,
            Pageable pageable
    );
}