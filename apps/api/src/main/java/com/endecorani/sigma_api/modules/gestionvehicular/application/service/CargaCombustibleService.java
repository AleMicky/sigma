package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.cargacombustible.request.CargaCombustibleRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.cargacombustible.request.CargaCombustibleUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.cargacombustible.response.*;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.CargaCombustibleMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.TipoBitacoraVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.BitacoraVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.CargaCombustible;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ViajeVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.BitacoraVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.CargaCombustibleRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ViajeVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SalidaVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringSalidaVehicularRepository;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.InsumoEntity;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.repository.SpringInsumoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CargaCombustibleService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "activoId",
            "viajeVehicularId",
            "salidaVehicularId",
            "insumoId",
            "fechaCarga",
            "litros",
            "precioTotal",
            "numeroFactura",
            "empleadoId",
            "createdAt",
            "updatedAt"
    );

    private final CargaCombustibleRepository repository;
    private final SpringActivoRepository springActivoRepository;
    private final ViajeVehicularRepository viajeVehicularRepository;
    private final SpringSalidaVehicularRepository springSalidaVehicularRepository;
    private final BitacoraVehicularRepository bitacoraVehicularRepository;
    private final SpringInsumoRepository springInsumoRepository;
    private final SpringVEmpleadoRepository springVEmpleadoRepository;
    private final CargaCombustibleMapper mapper;
    private final CargaCombustibleExcelService excelService;

    @Transactional(readOnly = true)
    public PageResponse<CargaCombustibleResponse> listar(
            String search,
            UUID activoId,
            UUID viajeVehicularId,
            UUID salidaVehicularId,
            UUID insumoId,
            UUID empleadoId,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta,
            PageRequestDto pageRequest
    ) {
        String normalizedSearch = StringUtils.normalize(search);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<CargaCombustible> resultado = repository.searchWithFilters(
                normalizedSearch,
                activoId,
                viajeVehicularId,
                salidaVehicularId,
                insumoId,
                empleadoId,
                fechaDesde,
                fechaHasta,
                pageable
        );

        return toPageResponse(resultado);
    }

    @Transactional(readOnly = true)
    public byte[] exportarExcel(
            String search,
            UUID activoId,
            UUID viajeVehicularId,
            UUID salidaVehicularId,
            UUID insumoId,
            UUID empleadoId,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta
    ) {
        String normalizedSearch = StringUtils.normalize(search);
        List<CargaCombustible> cargas = repository.findForExport(
                normalizedSearch,
                activoId,
                viajeVehicularId,
                salidaVehicularId,
                insumoId,
                empleadoId,
                fechaDesde,
                fechaHasta
        );
        List<CargaCombustibleResponse> responseList = toListResponse(cargas);
        return excelService.generarExcel(responseList, fechaDesde, fechaHasta);
    }

    @Transactional(readOnly = true)
    public CargaCombustibleResponse findById(UUID id) {
        CargaCombustible carga = obtenerPorId(id);
        return toResponse(carga);
    }

    @Transactional(readOnly = true)
    public List<CargaCombustibleResponse> findByActivoId(UUID activoId) {
        return toListResponse(repository.findByActivoId(activoId));
    }

    @Transactional(readOnly = true)
    public List<CargaCombustibleResponse> findByViajeVehicularId(UUID viajeVehicularId) {
        return toListResponse(repository.findByViajeVehicularId(viajeVehicularId));
    }

    @Transactional(readOnly = true)
    public List<CargaCombustibleResponse> findBySalidaVehicularId(UUID salidaVehicularId) {
        return toListResponse(repository.findBySalidaVehicularId(salidaVehicularId));
    }

    @Transactional
    public CargaCombustibleResponse create(CargaCombustibleRequest dto) {
        validarDependencias(dto.activoId(), dto.viajeVehicularId(), dto.salidaVehicularId(), dto.insumoId(), dto.empleadoId());

        CargaCombustible carga = mapper.toDomain(dto);
        if (carga.getFechaCarga() == null) {
            carga.setFechaCarga(LocalDateTime.now());
        }

        CargaCombustible guardada = repository.save(carga);
        CargaCombustibleResponse response = toResponse(guardada);

        if (guardada.getSalidaVehicularId() != null) {
            registrarBitacoraCombustible(guardada, response, dto);
        }

        return response;
    }

    @Transactional
    public CargaCombustibleResponse update(UUID id, CargaCombustibleUpdate dto) {
        CargaCombustible actual = obtenerPorId(id);
        validarDependencias(dto.activoId(), dto.viajeVehicularId(), dto.salidaVehicularId(), dto.insumoId(), dto.empleadoId());

        mapper.updateDomain(dto, actual);
        CargaCombustible actualizada = repository.save(actual);
        return toResponse(actualizada);
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Carga de combustible", id);
        }
        repository.deleteById(id);
    }

    private CargaCombustible obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Carga de combustible", id));
    }

    private void validarDependencias(
            UUID activoId,
            UUID viajeVehicularId,
            UUID salidaVehicularId,
            UUID insumoId,
            UUID empleadoId
    ) {
        if (activoId != null && !springActivoRepository.existsById(activoId)) {
            throw new ResourceNotFoundException("Activo vehicular", activoId);
        }
        if (viajeVehicularId != null && !viajeVehicularRepository.existsById(viajeVehicularId)) {
            throw new ResourceNotFoundException("Viaje vehicular", viajeVehicularId);
        }
        if (salidaVehicularId != null && !springSalidaVehicularRepository.existsById(salidaVehicularId)) {
            throw new ResourceNotFoundException("Salida vehicular", salidaVehicularId);
        }
        if (insumoId != null && !springInsumoRepository.existsById(insumoId)) {
            throw new ResourceNotFoundException("Insumo de combustible", insumoId);
        }
        if (empleadoId != null && !springVEmpleadoRepository.existsById(empleadoId)) {
            throw new ResourceNotFoundException("Empleado", empleadoId);
        }
    }

    private void registrarBitacoraCombustible(
            CargaCombustible carga,
            CargaCombustibleResponse response,
            CargaCombustibleRequest dto
    ) {
        UUID empleadoBitacora = carga.getEmpleadoId();
        if (empleadoBitacora == null) {
            empleadoBitacora = springSalidaVehicularRepository.findById(carga.getSalidaVehicularId())
                    .map(SalidaVehicularEntity::getEmpleadoId)
                    .orElse(null);
        }
        if (empleadoBitacora == null) {
            return;
        }

        String nombreInsumo = response.insumo() != null && response.insumo().nombre() != null
                ? response.insumo().nombre()
                : "Combustible";
        String facturaInfo = carga.getNumeroFactura() != null && !carga.getNumeroFactura().isBlank()
                ? " · Factura N° " + carga.getNumeroFactura().trim()
                : "";
        String descripcion = String.format(
                "Carga de combustible: %s L de %s por Bs. %s%s",
                carga.getLitros().stripTrailingZeros().toPlainString(),
                nombreInsumo,
                carga.getPrecioTotal().toPlainString(),
                facturaInfo
        );

        BitacoraVehicular bitacora = BitacoraVehicular.builder()
                .salidaVehicularId(carga.getSalidaVehicularId())
                .empleadoId(empleadoBitacora)
                .tipo(TipoBitacoraVehicular.ACTIVIDAD.name())
                .fechaHora(Instant.now())
                .descripcion(descripcion)
                .latitud(dto.latitud())
                .longitud(dto.longitud())
                .build();

        bitacoraVehicularRepository.save(bitacora);
    }

    private PageResponse<CargaCombustibleResponse> toPageResponse(Page<CargaCombustible> page) {
        if (page.isEmpty()) {
            return PageResponse.of(List.of(), page);
        }
        return PageResponse.of(toListResponse(page.getContent()), page);
    }

    private CargaCombustibleResponse toResponse(CargaCombustible domain) {
        List<CargaCombustibleResponse> responses = toListResponse(List.of(domain));
        return responses.isEmpty() ? mapper.toResponse(domain) : responses.getFirst();
    }

    private List<CargaCombustibleResponse> toListResponse(List<CargaCombustible> content) {
        if (content == null || content.isEmpty()) {
            return List.of();
        }

        Set<UUID> activoIds = content.stream()
                .map(CargaCombustible::getActivoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> viajeIds = content.stream()
                .map(CargaCombustible::getViajeVehicularId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> salidaIds = content.stream()
                .map(CargaCombustible::getSalidaVehicularId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> insumoIds = content.stream()
                .map(CargaCombustible::getInsumoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> empleadoIds = content.stream()
                .map(CargaCombustible::getEmpleadoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, CargaCombustibleActivoInfo> activoMap = activoIds.isEmpty()
                ? Map.of()
                : springActivoRepository.findAllById(activoIds).stream()
                .collect(Collectors.toMap(
                        ActivoEntity::getId,
                        a -> new CargaCombustibleActivoInfo(a.getId(), a.getCodigo(), a.getNombre()),
                        (a, b) -> a
                ));

        Map<UUID, CargaCombustibleViajeInfo> viajeMap = viajeIds.isEmpty()
                ? Map.of()
                : viajeVehicularRepository.findAllById(viajeIds).stream()
                .collect(Collectors.toMap(
                        ViajeVehicular::getId,
                        v -> new CargaCombustibleViajeInfo(v.getId(), v.getEstado(), v.getFechaSalidaReal(), v.getFechaRetornoReal()),
                        (a, b) -> a
                ));

        Map<UUID, CargaCombustibleSalidaInfo> salidaMap = salidaIds.isEmpty()
                ? Map.of()
                : springSalidaVehicularRepository.findAllById(salidaIds).stream()
                .collect(Collectors.toMap(
                        SalidaVehicularEntity::getId,
                        s -> new CargaCombustibleSalidaInfo(s.getId(), s.getNumero(), s.getEstado(), s.getDescripcionActividad()),
                        (a, b) -> a
                ));

        Map<UUID, CargaCombustibleInsumoInfo> insumoMap = insumoIds.isEmpty()
                ? Map.of()
                : springInsumoRepository.findAllById(insumoIds).stream()
                .collect(Collectors.toMap(
                        InsumoEntity::getId,
                        i -> new CargaCombustibleInsumoInfo(
                                i.getId(),
                                i.getCodigo(),
                                i.getNombre(),
                                i.getUnidadMedida() != null ? i.getUnidadMedida().getNombre() : null
                        ),
                        (a, b) -> a
                ));

        Map<UUID, CargaCombustibleEmpleadoInfo> empleadoMap = empleadoIds.isEmpty()
                ? Map.of()
                : springVEmpleadoRepository.findAllById(empleadoIds).stream()
                .collect(Collectors.toMap(
                        VEmpleadoEntity::getEmpleadoId,
                        e -> new CargaCombustibleEmpleadoInfo(e.getEmpleadoId(), e.getCodigo(), e.getNombreCompleto(), e.getCargo()),
                        (a, b) -> a
                ));

        return content.stream()
                .map(c -> mapper.toResponse(
                        c,
                        c.getActivoId() != null ? activoMap.get(c.getActivoId()) : null,
                        c.getViajeVehicularId() != null ? viajeMap.get(c.getViajeVehicularId()) : null,
                        c.getSalidaVehicularId() != null ? salidaMap.get(c.getSalidaVehicularId()) : null,
                        c.getInsumoId() != null ? insumoMap.get(c.getInsumoId()) : null,
                        c.getEmpleadoId() != null ? empleadoMap.get(c.getEmpleadoId()) : null
                ))
                .toList();
    }
}
