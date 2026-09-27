package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.request.FlotaVehiculoRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.request.FlotaVehiculoUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.response.FlotaVehiculoActivoInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.response.FlotaVehiculoFlotaInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.response.FlotaVehiculoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.FlotaVehiculoMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.FlotaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.FlotaVehiculo;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.FlotaVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.FlotaVehiculoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlotaVehiculoService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "flotaVehicularId",
            "activoId",
            "activo",
            "createdAt",
            "updatedAt"
    );

    private final FlotaVehiculoRepository repository;
    private final FlotaVehicularRepository flotaVehicularRepository;
    private final SpringActivoRepository springActivoRepository;
    private final FlotaVehiculoMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<FlotaVehiculoResponse> listar(
            UUID flotaVehicularId,
            UUID activoId,
            Boolean activo,
            PageRequestDto pageRequest
    ) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<FlotaVehiculo> resultado = repository.searchWithFilters(flotaVehicularId, activoId, activo, pageable);
        return toPageResponse(resultado);
    }

    @Transactional(readOnly = true)
    public List<FlotaVehiculoResponse> findByFlotaVehicularId(UUID flotaVehicularId) {
        validarFlotaExiste(flotaVehicularId);
        List<FlotaVehiculo> vehiculos = repository.findByFlotaVehicularId(flotaVehicularId);
        return toListResponse(vehiculos);
    }

    @Transactional(readOnly = true)
    public FlotaVehiculoResponse findById(UUID id) {
        FlotaVehiculo flotaVehiculo = obtenerPorId(id);
        return toResponse(flotaVehiculo);
    }

    @Transactional
    public FlotaVehiculoResponse create(FlotaVehiculoRequest dto) {
        validarFlotaExiste(dto.flotaVehicularId());
        validarActivoExiste(dto.activoId());
        validarVehiculoUnicoEnFlotaParaCrear(dto.flotaVehicularId(), dto.activoId());

        FlotaVehiculo flotaVehiculo = mapper.toDomain(dto);
        if (dto.activo() != null) {
            flotaVehiculo.setActivo(dto.activo());
        } else {
            flotaVehiculo.setActivo(true);
        }

        FlotaVehiculo guardado = repository.save(flotaVehiculo);
        return toResponse(guardado);
    }

    @Transactional
    public FlotaVehiculoResponse update(UUID id, FlotaVehiculoUpdate dto) {
        FlotaVehiculo actual = obtenerPorId(id);

        validarFlotaExiste(dto.flotaVehicularId());
        validarActivoExiste(dto.activoId());
        validarVehiculoUnicoEnFlotaParaActualizar(dto.flotaVehicularId(), dto.activoId(), id);

        mapper.updateDomain(dto, actual);
        if (dto.activo() != null) {
            actual.setActivo(dto.activo());
        }

        FlotaVehiculo actualizado = repository.save(actual);
        return toResponse(actualizado);
    }

    @Transactional
    public FlotaVehiculoResponse toggleActivo(UUID id) {
        FlotaVehiculo actual = obtenerPorId(id);
        actual.setActivo(!actual.isActivo());
        FlotaVehiculo actualizado = repository.save(actual);
        return toResponse(actualizado);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private PageResponse<FlotaVehiculoResponse> toPageResponse(Page<FlotaVehiculo> page) {
        if (page.isEmpty()) {
            return PageResponse.of(List.of(), page);
        }
        List<FlotaVehiculoResponse> responses = toListResponse(page.getContent());
        return PageResponse.of(responses, page);
    }

    private List<FlotaVehiculoResponse> toListResponse(List<FlotaVehiculo> content) {
        if (content.isEmpty()) {
            return List.of();
        }

        Set<UUID> flotaIds = content.stream()
                .map(FlotaVehiculo::getFlotaVehicularId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> activoIds = content.stream()
                .map(FlotaVehiculo::getActivoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, FlotaVehiculoFlotaInfo> flotaMap = flotaIds.isEmpty()
                ? Map.of()
                : flotaIds.stream()
                .map(flotaVehicularRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toMap(
                        FlotaVehicular::getId,
                        f -> new FlotaVehiculoFlotaInfo(f.getId(), f.getCodigo(), f.getNombre()),
                        (a, b) -> a
                ));

        Map<UUID, FlotaVehiculoActivoInfo> activoMap = activoIds.isEmpty()
                ? Map.of()
                : springActivoRepository.findAllById(activoIds).stream()
                .collect(Collectors.toMap(
                        ActivoEntity::getId,
                        a -> new FlotaVehiculoActivoInfo(
                                a.getId(),
                                a.getCodigo(),
                                a.getNombre(),
                                a.getDescripcion(),
                                a.getUrlImagen()
                        ),
                        (a, b) -> a
                ));

        return content.stream()
                .map(domain -> {
                    FlotaVehiculoFlotaInfo flotaInfo = domain.getFlotaVehicularId() != null ? flotaMap.get(domain.getFlotaVehicularId()) : null;
                    FlotaVehiculoActivoInfo activoInfo = domain.getActivoId() != null ? activoMap.get(domain.getActivoId()) : null;
                    return mapper.toResponse(domain, flotaInfo, activoInfo);
                })
                .toList();
    }

    private FlotaVehiculoResponse toResponse(FlotaVehiculo domain) {
        FlotaVehiculoFlotaInfo flotaInfo = domain.getFlotaVehicularId() != null
                ? flotaVehicularRepository.findById(domain.getFlotaVehicularId())
                .map(f -> new FlotaVehiculoFlotaInfo(f.getId(), f.getCodigo(), f.getNombre()))
                .orElse(null)
                : null;

        FlotaVehiculoActivoInfo activoInfo = domain.getActivoId() != null
                ? springActivoRepository.findById(domain.getActivoId())
                .map(a -> new FlotaVehiculoActivoInfo(a.getId(), a.getCodigo(), a.getNombre(), a.getDescripcion(), a.getUrlImagen()))
                .orElse(null)
                : null;

        return mapper.toResponse(domain, flotaInfo, activoInfo);
    }

    private FlotaVehiculo obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo de flota", id));
    }

    private void validarFlotaExiste(UUID flotaVehicularId) {
        if (flotaVehicularId == null || !flotaVehicularRepository.existsById(flotaVehicularId)) {
            throw new ResourceNotFoundException("Flota vehicular", flotaVehicularId);
        }
    }

    private void validarActivoExiste(UUID activoId) {
        if (activoId == null || !springActivoRepository.existsById(activoId)) {
            throw new ResourceNotFoundException("Vehículo (Activo)", activoId);
        }
    }

    private void validarVehiculoUnicoEnFlotaParaCrear(UUID flotaVehicularId, UUID activoId) {
        if (repository.existsByFlotaVehicularIdAndActivoId(flotaVehicularId, activoId)) {
            throw new ConflictException(
                    "FLOTA_VEHICULO_ALREADY_EXISTS",
                    "El vehículo ya se encuentra asignado a la flota vehicular indicada"
            );
        }
    }

    private void validarVehiculoUnicoEnFlotaParaActualizar(UUID flotaVehicularId, UUID activoId, UUID currentId) {
        if (repository.existsByFlotaVehicularIdAndActivoIdAndIdNot(flotaVehicularId, activoId, currentId)) {
            throw new ConflictException(
                    "FLOTA_VEHICULO_ALREADY_EXISTS",
                    "El vehículo ya se encuentra asignado a la flota vehicular indicada"
            );
        }
    }
}
