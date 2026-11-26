package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.CorrelativoEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringCorrelativoRepository  extends JpaRepository<CorrelativoEntity, UUID> {
    boolean existsByCodigoIgnoreCaseAndGestion(
            String codigo,
            Integer gestion
    );

    /**
     * Inicialización concurrency-safe: el conflicto se resuelve en la propia BD,
     * evitando una violación de unicidad que dejaría abortada la transacción.
     */
    @Modifying
    @Query(value = """
            INSERT INTO parametros.correlativos (id, codigo, gestion, ultimo_numero, prefijo, longitud)
            VALUES (:id, :codigo, :gestion, :ultimoNumero, :prefijo, :longitud)
            ON CONFLICT (codigo, gestion) DO NOTHING
            """, nativeQuery = true)
    int insertIfAbsent(
            @Param("id") UUID id,
            @Param("codigo") String codigo,
            @Param("gestion") Integer gestion,
            @Param("ultimoNumero") Integer ultimoNumero,
            @Param("prefijo") String prefijo,
            @Param("longitud") Integer longitud
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select correlativo
            from CorrelativoEntity correlativo
            where lower(correlativo.codigo) = lower(:codigo)
              and correlativo.gestion = :gestion
            """)
    Optional<CorrelativoEntity> findForUpdate(
            @Param("codigo") String codigo,
            @Param("gestion") Integer gestion
    );
}
