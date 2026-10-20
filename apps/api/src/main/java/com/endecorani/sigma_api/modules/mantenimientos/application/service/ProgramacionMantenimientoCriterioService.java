package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ProgramacionMantenimientoCriterioRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ProgramacionMantenimientoCriterioUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.ProgramacionMantenimientoCriterioResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoCriterioMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActivo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoCriterio;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ProgramacionMantenimientoCriterioRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ProgramacionMantenimientoRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProgramacionMantenimientoCriterioService {

    private final ProgramacionMantenimientoCriterioRepository repository;
    private final ProgramacionMantenimientoRepository programacionRepository;
    private final PlanMantenimientoActivoRepository planMantenimientoActivoRepository;
    private final ActivoRepository activoRepository;
    private final SpringActivoAtributoRepository springActivoAtributoRepository;
    private final ProgramacionMantenimientoCriterioMapper mapper;

    @Transactional
    public ProgramacionMantenimientoCriterioResponse create(UUID programacionId, ProgramacionMantenimientoCriterioRequest request) {
        log.info("Agregando criterio {} a la programación {}", request.tipoCriterio(), programacionId);

        ProgramacionMantenimiento programacion = programacionRepository.findById(programacionId)
                .orElseThrow(() -> new ResourceNotFoundException("Programación de mantenimiento no encontrada: " + programacionId));

        PlanMantenimientoActivo planActivo = planMantenimientoActivoRepository.findById(programacion.getPlanMantenimientoActivoId())
                .orElseThrow(() -> new ResourceNotFoundException("Asignación de activo al plan no encontrada"));

        Activo activo = activoRepository.findById(planActivo.getActivoId())
                .orElseThrow(() -> new ResourceNotFoundException("Activo no encontrado: " + planActivo.getActivoId()));

        // Regla 2: No permitir dos criterios del mismo tipo dentro de una misma programación
        if (repository.existsByProgramacionMantenimientoIdAndTipoCriterio(programacionId, request.tipoCriterio())) {
            throw new ConflictException(
                    "Ya existe un criterio del tipo " + request.tipoCriterio() + " configurado en esta programación."
            );
        }

        // Regla 3: Validar que el activo pueda proporcionar el dato requerido
        validarCapacidadActivo(activo, request.tipoCriterio());

        ProgramacionMantenimientoCriterio domain = mapper.toDomain(request);
        domain.setProgramacionMantenimientoId(programacionId);

        ProgramacionMantenimientoCriterio saved = repository.save(domain);
        return mapper.toResponse(saved);
    }

    @Transactional
    public ProgramacionMantenimientoCriterioResponse update(UUID id, ProgramacionMantenimientoCriterioUpdate request) {
        log.info("Actualizando criterio {}", id);

        ProgramacionMantenimientoCriterio criterion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Criterio de programación no encontrado: " + id));

        ProgramacionMantenimiento programacion = programacionRepository.findById(criterion.getProgramacionMantenimientoId())
                .orElseThrow(() -> new ResourceNotFoundException("Programación asociada no encontrada"));

        PlanMantenimientoActivo planActivo = planMantenimientoActivoRepository.findById(programacion.getPlanMantenimientoActivoId())
                .orElseThrow(() -> new ResourceNotFoundException("Asignación de activo al plan no encontrada"));

        Activo activo = activoRepository.findById(planActivo.getActivoId())
                .orElseThrow(() -> new ResourceNotFoundException("Activo no encontrado: " + planActivo.getActivoId()));

        // Regla 2: Si cambia el tipo, validar unicidad
        if (request.tipoCriterio() != null && !request.tipoCriterio().equals(criterion.getTipoCriterio())) {
            if (repository.existsByProgramacionMantenimientoIdAndTipoCriterioAndIdNot(
                    criterion.getProgramacionMantenimientoId(),
                    request.tipoCriterio(),
                    id
            )) {
                throw new ConflictException(
                        "Ya existe un criterio del tipo " + request.tipoCriterio() + " en esta programación."
                );
            }
            // Regla 3
            validarCapacidadActivo(activo, request.tipoCriterio());
        }

        // Regla 1: Cada programación debe tener al menos un criterio activo
        if (request.activo() != null && !request.activo() && Boolean.TRUE.equals(criterion.getActivo())) {
            long activosCount = repository.countByProgramacionMantenimientoIdAndActivoTrue(criterion.getProgramacionMantenimientoId());
            if (activosCount <= 1) {
                throw new BusinessException("Cada programación debe tener al menos un criterio activo. No se puede desactivar el único criterio activo.");
            }
        }

        mapper.updateDomain(request, criterion);
        ProgramacionMantenimientoCriterio saved = repository.save(criterion);
        return mapper.toResponse(saved);
    }

    @Transactional
    public ProgramacionMantenimientoCriterioResponse activar(UUID id) {
        ProgramacionMantenimientoCriterio criterion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Criterio de programación no encontrado: " + id));
        criterion.setActivo(true);
        return mapper.toResponse(repository.save(criterion));
    }

    @Transactional
    public ProgramacionMantenimientoCriterioResponse desactivar(UUID id) {
        ProgramacionMantenimientoCriterio criterion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Criterio de programación no encontrado: " + id));

        // Regla 1: Cada programación debe tener al menos un criterio activo
        long activosCount = repository.countByProgramacionMantenimientoIdAndActivoTrue(criterion.getProgramacionMantenimientoId());
        if (activosCount <= 1) {
            throw new BusinessException("Cada programación debe tener al menos un criterio activo. No se puede desactivar el único criterio activo.");
        }

        criterion.setActivo(false);
        return mapper.toResponse(repository.save(criterion));
    }

    @Transactional
    public void delete(UUID id) {
        ProgramacionMantenimientoCriterio criterion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Criterio de programación no encontrado: " + id));

        // Regla 1: Cada programación debe tener al menos un criterio activo
        if (Boolean.TRUE.equals(criterion.getActivo())) {
            long activosCount = repository.countByProgramacionMantenimientoIdAndActivoTrue(criterion.getProgramacionMantenimientoId());
            if (activosCount <= 1) {
                throw new BusinessException("Cada programación debe tener al menos un criterio activo. No se puede eliminar el único criterio activo.");
            }
        }

        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public ProgramacionMantenimientoCriterioResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Criterio de programación no encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<ProgramacionMantenimientoCriterioResponse> findByProgramacionId(UUID programacionId) {
        return repository.findByProgramacionMantenimientoId(programacionId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Regla 3: Validar que el activo pueda proporcionar el dato requerido: kilometraje u horas de uso.
     */
    public void validarCapacidadActivo(Activo activo, TipoCriterioMantenimiento tipoCriterio) {
        if (tipoCriterio == null || tipoCriterio == TipoCriterioMantenimiento.TIEMPO) {
            return;
        }

        UUID tipoActivoId = activo.getTipoActivoId();
        if (tipoActivoId == null) {
            throw new BusinessException(
                    "El activo '" + activo.getCodigo() + " - " + activo.getNombre() +
                    "' no tiene asignado un tipo de activo para validar sus atributos de medición."
            );
        }

        if (tipoCriterio == TipoCriterioMantenimiento.KILOMETRAJE) {
            boolean soportaKm = springActivoAtributoRepository.existsByTipoActivoIdAndCodigoIgnoreCase(tipoActivoId, "KILOMETRAJE")
                    || springActivoAtributoRepository.existsByTipoActivoIdAndCodigoIgnoreCase(tipoActivoId, "KM")
                    || springActivoAtributoRepository.existsByTipoActivoIdAndCodigoIgnoreCase(tipoActivoId, "ODOMETRO");

            if (!soportaKm) {
                throw new BusinessException(
                        "El activo '" + activo.getCodigo() + " - " + activo.getNombre() +
                        "' no puede proporcionar kilometraje debido a que su tipo de activo no posee un atributo de odómetro o kilometraje."
                );
            }
        } else if (tipoCriterio == TipoCriterioMantenimiento.HORAS_USO) {
            boolean soportaHoras = springActivoAtributoRepository.existsByTipoActivoIdAndCodigoIgnoreCase(tipoActivoId, "HORAS_USO")
                    || springActivoAtributoRepository.existsByTipoActivoIdAndCodigoIgnoreCase(tipoActivoId, "HOROMETRO")
                    || springActivoAtributoRepository.existsByTipoActivoIdAndCodigoIgnoreCase(tipoActivoId, "HORAS")
                    || springActivoAtributoRepository.existsByTipoActivoIdAndCodigoIgnoreCase(tipoActivoId, "HORAS_TRABAJO");

            if (!soportaHoras) {
                throw new BusinessException(
                        "El activo '" + activo.getCodigo() + " - " + activo.getNombre() +
                        "' no puede proporcionar horas de uso debido a que su tipo de activo no posee un atributo de horómetro u horas de trabajo."
                );
            }
        }
    }
}
