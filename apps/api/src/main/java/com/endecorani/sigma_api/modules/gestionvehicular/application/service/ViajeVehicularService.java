package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.response.AsignacionVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.request.CancelarViajeRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.request.RegistrarRetornoViajeRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.request.RegistrarSalidaViajeRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.request.ViajeVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.request.ViajeVehicularUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.response.ViajeVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.ViajeVehicularMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ViajeVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.AsignacionVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ViajeVehicularRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ViajeVehicularService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "asignacionVehicularId",
            "fechaSalidaReal",
            "kilometrajeSalida",
            "nivelCombustibleSalida",
            "fechaRetornoReal",
            "kilometrajeRetorno",
            "nivelCombustibleRetorno",
            "estado",
            "createdAt",
            "updatedAt"
    );

    private final ViajeVehicularRepository repository;
    private final AsignacionVehicularRepository asignacionVehicularRepository;
    private final AsignacionVehicularService asignacionVehicularService;
    private final ViajeVehicularMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<ViajeVehicularResponse> listar(
            String search,
            UUID asignacionVehicularId,
            UUID solicitudVehicularId,
            UUID activoId,
            UUID conductorId,
            EstadoViajeVehicular estado,
            PageRequestDto pageRequest
    ) {
        String normalizedSearch = StringUtils.normalize(search);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ViajeVehicular> resultado = repository.searchWithFilters(
                normalizedSearch,
                asignacionVehicularId,
                solicitudVehicularId,
                activoId,
                conductorId,
                estado,
                pageable
        );

        return toPageResponse(resultado);
    }

    @Transactional(readOnly = true)
    public ViajeVehicularResponse findById(UUID id) {
        ViajeVehicular viaje = obtenerPorId(id);
        return toResponse(viaje);
    }

    @Transactional(readOnly = true)
    public ViajeVehicularResponse findByAsignacionVehicularId(UUID asignacionVehicularId) {
        return repository.findByAsignacionVehicularId(asignacionVehicularId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Viaje de la asignación vehicular", asignacionVehicularId));
    }

    @Transactional(readOnly = true)
    public ViajeVehicularResponse findBySolicitudVehicularId(UUID solicitudVehicularId) {
        return repository.findBySolicitudVehicularId(solicitudVehicularId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Viaje de la solicitud vehicular", solicitudVehicularId));
    }

    @Transactional(readOnly = true)
    public List<ViajeVehicularResponse> findByConductorId(UUID conductorId) {
        return repository.findByConductorId(conductorId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ViajeVehicularResponse> findByActivoId(UUID activoId) {
        return repository.findByActivoId(activoId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ViajeVehicularResponse findUltimoByActivoId(UUID activoId) {
        return repository.findUltimoByActivoId(activoId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Último viaje del activo vehicular", activoId));
    }

    @Transactional
    public ViajeVehicularResponse create(ViajeVehicularRequest dto) {
        validarAsignacionExiste(dto.asignacionVehicularId());

        if (repository.existsByAsignacionVehicularId(dto.asignacionVehicularId())) {
            throw new ConflictException("Ya existe un viaje registrado para esta asignación vehicular");
        }

        ViajeVehicular domain = mapper.toDomain(dto);
        if (domain.getEstado() == null) {
            domain.setEstado(EstadoViajeVehicular.PROGRAMADO);
        }
        domain.setObservacion(StringUtils.normalize(dto.observacion()));

        ViajeVehicular guardado = repository.save(domain);
        return toResponse(guardado);
    }

    @Transactional
    public ViajeVehicularResponse update(UUID id, ViajeVehicularUpdate dto) {
        ViajeVehicular actual = obtenerPorId(id);

        if (!actual.getAsignacionVehicularId().equals(dto.asignacionVehicularId())) {
            validarAsignacionExiste(dto.asignacionVehicularId());
            if (repository.existsByAsignacionVehicularId(dto.asignacionVehicularId())) {
                throw new ConflictException("Ya existe un viaje registrado para esta asignación vehicular");
            }
        }

        mapper.updateDomain(dto, actual);
        actual.setObservacion(StringUtils.normalize(dto.observacion()));

        ViajeVehicular actualizado = repository.save(actual);
        return toResponse(actualizado);
    }

    @Transactional
    public ViajeVehicularResponse registrarSalida(UUID id, RegistrarSalidaViajeRequest dto) {
        ViajeVehicular viaje = obtenerPorId(id);

        if (viaje.getEstado() == EstadoViajeVehicular.FINALIZADO || viaje.getEstado() == EstadoViajeVehicular.CANCELADO) {
            throw new BusinessException("No se puede registrar salida para un viaje en estado " + viaje.getEstado());
        }

        viaje.setFechaSalidaReal(dto.fechaSalidaReal() != null ? dto.fechaSalidaReal() : LocalDateTime.now());
        viaje.setKilometrajeSalida(dto.kilometrajeSalida());
        if (dto.nivelCombustibleSalida() != null) {
            viaje.setNivelCombustibleSalida(dto.nivelCombustibleSalida());
        }
        viaje.setEstado(EstadoViajeVehicular.EN_CURSO);

        if (dto.observacion() != null && !dto.observacion().isBlank()) {
            viaje.setObservacion(StringUtils.normalize(dto.observacion()));
        }

        ViajeVehicular guardado = repository.save(viaje);
        return toResponse(guardado);
    }

    @Transactional
    public ViajeVehicularResponse registrarRetorno(UUID id, RegistrarRetornoViajeRequest dto) {
        ViajeVehicular viaje = obtenerPorId(id);

        if (viaje.getEstado() == EstadoViajeVehicular.CANCELADO) {
            throw new BusinessException("No se puede registrar retorno para un viaje cancelado");
        }

        if (viaje.getKilometrajeSalida() != null && dto.kilometrajeRetorno() < viaje.getKilometrajeSalida()) {
            throw new BusinessException("El kilometraje de retorno (" + dto.kilometrajeRetorno()
                    + ") no puede ser menor al kilometraje de salida (" + viaje.getKilometrajeSalida() + ")");
        }

        viaje.setFechaRetornoReal(dto.fechaRetornoReal() != null ? dto.fechaRetornoReal() : LocalDateTime.now());
        viaje.setKilometrajeRetorno(dto.kilometrajeRetorno());
        if (dto.nivelCombustibleRetorno() != null) {
            viaje.setNivelCombustibleRetorno(dto.nivelCombustibleRetorno());
        }
        viaje.setEstado(EstadoViajeVehicular.FINALIZADO);

        if (dto.observacion() != null && !dto.observacion().isBlank()) {
            viaje.setObservacion(StringUtils.normalize(dto.observacion()));
        }

        ViajeVehicular guardado = repository.save(viaje);
        return toResponse(guardado);
    }

    @Transactional
    public ViajeVehicularResponse cancelar(UUID id, CancelarViajeRequest dto) {
        ViajeVehicular viaje = obtenerPorId(id);

        if (viaje.getEstado() == EstadoViajeVehicular.FINALIZADO) {
            throw new BusinessException("No se puede cancelar un viaje que ya ha sido finalizado");
        }
        if (viaje.getEstado() == EstadoViajeVehicular.CANCELADO) {
            throw new BusinessException("El viaje ya se encuentra cancelado");
        }

        viaje.setEstado(EstadoViajeVehicular.CANCELADO);
        String motivo = StringUtils.normalize(dto.motivoCancelacion());
        if (viaje.getObservacion() != null && !viaje.getObservacion().isBlank()) {
            viaje.setObservacion(viaje.getObservacion() + " | Cancelado: " + motivo);
        } else {
            viaje.setObservacion("Cancelado: " + motivo);
        }

        ViajeVehicular guardado = repository.save(viaje);
        return toResponse(guardado);
    }

    @Transactional
    public void delete(UUID id) {
        ViajeVehicular viaje = obtenerPorId(id);
        repository.deleteById(viaje.getId());
    }

    private ViajeVehicular obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Viaje vehicular", id));
    }

    private void validarAsignacionExiste(UUID asignacionVehicularId) {
        if (asignacionVehicularId != null && asignacionVehicularRepository.findById(asignacionVehicularId).isEmpty()) {
            throw new ResourceNotFoundException("Asignación vehicular", asignacionVehicularId);
        }
    }

    private ViajeVehicularResponse toResponse(ViajeVehicular viaje) {
        AsignacionVehicularResponse asignacionInfo = null;
        if (viaje.getAsignacionVehicularId() != null) {
            try {
                asignacionInfo = asignacionVehicularService.findById(viaje.getAsignacionVehicularId());
            } catch (Exception ignored) {
            }
        }
        return mapper.toResponse(viaje, asignacionInfo);
    }

    private PageResponse<ViajeVehicularResponse> toPageResponse(Page<ViajeVehicular> page) {
        List<ViajeVehicular> content = page.getContent();
        if (content.isEmpty()) {
            return PageResponse.from(page, mapper::toResponse);
        }

        Set<UUID> asignacionIds = content.stream()
                .map(ViajeVehicular::getAsignacionVehicularId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, AsignacionVehicularResponse> asignacionesMap = new HashMap<>();
        for (UUID asigId : asignacionIds) {
            try {
                asignacionesMap.put(asigId, asignacionVehicularService.findById(asigId));
            } catch (Exception ignored) {
            }
        }

        List<ViajeVehicularResponse> responses = content.stream()
                .map(v -> mapper.toResponse(v, asignacionesMap.get(v.getAsignacionVehicularId())))
                .toList();

        return PageResponse.of(responses, page);
    }
}
