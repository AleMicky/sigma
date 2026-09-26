package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.tiposolicitudvehicular.request.TipoSolicitudVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.tiposolicitudvehicular.request.TipoSolicitudVehicularUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.tiposolicitudvehicular.response.TipoSolicitudVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.TipoSolicitudVehicularMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.TipoSolicitudVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.TipoSolicitudVehicularRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TipoSolicitudVehicularService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "descripcion",
            "diasAnticipacion",
            "requiereRespaldo",
            "requiereJustificacion",
            "createdAt",
            "updatedAt"
    );

    private final TipoSolicitudVehicularRepository repository;
    private final TipoSolicitudVehicularMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<TipoSolicitudVehicularResponse> listar(String search, PageRequestDto pageRequest) {
        String normalized = StringUtils.normalize(search);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<TipoSolicitudVehicular> resultado;

        if (normalized == null || normalized.isBlank()) {
            resultado = repository.findAll(pageable);
        } else {
            resultado = repository.search(normalized, pageable);
        }

        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TipoSolicitudVehicularResponse findById(UUID id) {
        TipoSolicitudVehicular tipo = obtenerPorId(id);
        return mapper.toResponse(tipo);
    }

    @Transactional
    public TipoSolicitudVehicularResponse create(TipoSolicitudVehicularRequest dto) {
        String codigo = StringUtils.normalize(dto.codigo());
        validarCodigoUnicoParaCrear(codigo);

        TipoSolicitudVehicular tipo = TipoSolicitudVehicular.builder()
                .codigo(codigo)
                .nombre(StringUtils.normalize(dto.nombre()))
                .descripcion(StringUtils.normalize(dto.descripcion()))
                .diasAnticipacion(dto.diasAnticipacion())
                .requiereRespaldo(dto.requiereRespaldo())
                .requiereJustificacion(dto.requiereJustificacion())
                .build();

        TipoSolicitudVehicular guardado = repository.save(tipo);
        return mapper.toResponse(guardado);
    }

    @Transactional
    public TipoSolicitudVehicularResponse update(UUID id, TipoSolicitudVehicularUpdate dto) {
        TipoSolicitudVehicular actual = obtenerPorId(id);

        String codigo = StringUtils.normalize(dto.codigo());
        validarCodigoUnicoParaActualizar(codigo, id);

        actual.setCodigo(codigo);
        actual.setNombre(StringUtils.normalize(dto.nombre()));
        actual.setDescripcion(StringUtils.normalize(dto.descripcion()));
        actual.setDiasAnticipacion(dto.diasAnticipacion());
        actual.setRequiereRespaldo(dto.requiereRespaldo());
        actual.setRequiereJustificacion(dto.requiereJustificacion());

        TipoSolicitudVehicular actualizado = repository.save(actual);
        return mapper.toResponse(actualizado);
    }

    @Transactional
    public TipoSolicitudVehicularResponse update(UUID id, TipoSolicitudVehicularRequest dto) {
        TipoSolicitudVehicular actual = obtenerPorId(id);

        String codigo = StringUtils.normalize(dto.codigo());
        validarCodigoUnicoParaActualizar(codigo, id);

        actual.setCodigo(codigo);
        actual.setNombre(StringUtils.normalize(dto.nombre()));
        actual.setDescripcion(StringUtils.normalize(dto.descripcion()));
        actual.setDiasAnticipacion(dto.diasAnticipacion());
        actual.setRequiereRespaldo(dto.requiereRespaldo());
        actual.setRequiereJustificacion(dto.requiereJustificacion());

        TipoSolicitudVehicular actualizado = repository.save(actual);
        return mapper.toResponse(actualizado);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private TipoSolicitudVehicular obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Tipo de solicitud vehicular", id)
                );
    }

    private void validarCodigoUnicoParaCrear(String codigo) {
        if (codigo != null && repository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "TIPO_SOLICITUD_VEHICULAR_ALREADY_EXISTS",
                    "Ya existe un tipo de solicitud vehicular con el código '%s'".formatted(codigo)
            );
        }
    }

    private void validarCodigoUnicoParaActualizar(String codigo, UUID currentId) {
        if (codigo != null && repository.existsByCodigoIgnoreCaseAndIdNot(codigo, currentId)) {
            throw new ConflictException(
                    "TIPO_SOLICITUD_VEHICULAR_ALREADY_EXISTS",
                    "Ya existe otro tipo de solicitud vehicular con el código '%s'".formatted(codigo)
            );
        }
    }
}
