package com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoCuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.Cuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioRepository;
import com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.entity.CuestionarioEntity;
import com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.mapper.CuestionarioPersistenceMapper;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class JpaCuestionarioRepositoryAdapter implements CuestionarioRepository {

    private final SpringCuestionarioRepository springRepository;
    private final CuestionarioPersistenceMapper mapper;

    @Override
    public Cuestionario save(Cuestionario cuestionario) {
        return mapper.toDomain(springRepository.save(mapper.toEntity(cuestionario)));
    }

    @Override
    public Cuestionario saveAndFlush(Cuestionario cuestionario) {
        return mapper.toDomain(springRepository.saveAndFlush(mapper.toEntity(cuestionario)));
    }

    @Override
    public Optional<Cuestionario> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Cuestionario> findAllById(Collection<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return springRepository.findAllById(ids).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Page<Cuestionario> search(
            String q,
            String moduloOrigen,
            EstadoCuestionario estado,
            Boolean activo,
            Pageable pageable
    ) {
        Specification<CuestionarioEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("codigo")), pattern),
                        cb.like(cb.lower(root.get("nombre")), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get("descripcion"), "")), pattern)
                ));
            }
            if (moduloOrigen != null && !moduloOrigen.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("moduloOrigen")), moduloOrigen.trim().toUpperCase(Locale.ROOT)));
            }
            if (estado != null) {
                predicates.add(cb.equal(root.get("estado"), estado));
            }
            if (activo != null) {
                predicates.add(cb.equal(root.get("activo"), activo));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        return springRepository.findAll(spec, pageable).map(mapper::toDomain);
    }

    @Override
    public boolean existsByCodigoIgnoreCase(String codigo) {
        return springRepository.existsByCodigoIgnoreCase(codigo);
    }

    @Override
    public boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id) {
        return springRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, id);
    }

    @Override
    public Optional<Cuestionario> findPublishedActiveByDisparador(
            String moduloOrigen,
            String entidadTipo,
            String eventoDisparador
    ) {
        return springRepository
                .findFirstByModuloOrigenAndEntidadTipoAndEventoDisparadorAndEstadoAndActivoTrue(
                        moduloOrigen, entidadTipo, eventoDisparador, EstadoCuestionario.PUBLICADO
                )
                .map(mapper::toDomain);
    }

    @Override
    public List<Cuestionario> findPublishedActiveByDisparadorExcludingId(
            String moduloOrigen,
            String entidadTipo,
            String eventoDisparador,
            UUID excludeId
    ) {
        return springRepository
                .findByModuloOrigenAndEntidadTipoAndEventoDisparadorAndEstadoAndActivoTrueAndIdNot(
                        moduloOrigen, entidadTipo, eventoDisparador, EstadoCuestionario.PUBLICADO, excludeId
                )
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }
}
