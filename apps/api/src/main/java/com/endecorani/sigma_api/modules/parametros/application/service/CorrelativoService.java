package com.endecorani.sigma_api.modules.parametros.application.service;

import com.endecorani.sigma_api.modules.parametros.application.dto.request.CorrelativoRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.response.CorrelativoResponse;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.modules.parametros.domain.model.Correlativo;
import com.endecorani.sigma_api.modules.parametros.domain.repository.CorrelativoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;


@Service
@RequiredArgsConstructor
public class CorrelativoService {

    private final CorrelativoRepository correlativoRepository;

    @Transactional
    public CorrelativoResponse crear(CorrelativoRequest request) {

        boolean existe = correlativoRepository.existsByCodigoAndGestion(request.codigo(), request.gestion());

        if (existe) {
            throw new IllegalStateException("Ya existe un correlativo con código " + request.codigo() + " para la gestión " + request.gestion());
        }

        Correlativo correlativo = Correlativo.builder()
                .id(UUID.randomUUID())
                .codigo(request.codigo().trim().toUpperCase())
                .gestion(request.gestion())
                .ultimoNumero(0)
                .prefijo(request.prefijo() != null
                                ? request.prefijo().trim().toUpperCase()
                                : null
                )
                .longitud(request.longitud())
                .build();

        Correlativo saved = correlativoRepository.save(correlativo);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public CorrelativoResponse obtener(UUID id) {

        Correlativo correlativo = correlativoRepository
                .findById(id)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "No existe el correlativo con id: " + id
                        )
                );

        return toResponse(correlativo);
    }

    @Transactional
    public String generar(String codigo, Integer gestion) {
        String codigoNormalizado = codigo.trim().toUpperCase();

        Correlativo correlativo = correlativoRepository
                .findForUpdate(codigoNormalizado, gestion)
                .orElseGet(() -> inicializarCorrelativo(codigoNormalizado, gestion));

        int siguienteNumero = correlativo.getUltimoNumero() + 1;
        correlativo.setUltimoNumero(siguienteNumero);
        correlativoRepository.save(correlativo);
        return construirNumero(correlativo, siguienteNumero);
    }

    private Correlativo inicializarCorrelativo(String codigo, Integer gestion) {
        String prefijo = resolverPrefijoPorDefecto(codigo);
        int longitud = resolverLongitudPorDefecto(codigo);

        Correlativo nuevo = Correlativo.builder()
                .id(UUID.randomUUID())
                .codigo(codigo)
                .gestion(gestion)
                .ultimoNumero(0)
                .prefijo(prefijo)
                .longitud(longitud)
                .build();

        try {
            return correlativoRepository.save(nuevo);
        } catch (Exception e) {
            return correlativoRepository.findForUpdate(codigo, gestion)
                    .orElseThrow(() -> new IllegalStateException("Error al inicializar correlativo para " + codigo + " gestión " + gestion, e));
        }
    }

    private String resolverPrefijoPorDefecto(String codigo) {
        return switch (codigo) {
            case CorrelativoCodigo.SOLICITUD_MANTENIMIENTO -> "SM";
            case CorrelativoCodigo.ORDEN_TRABAJO -> "OT";
            case CorrelativoCodigo.ACTIVO -> "ACT";
            default -> {
                String[] partes = codigo.split("_");
                if (partes.length > 1) {
                    StringBuilder sb = new StringBuilder();
                    for (String parte : partes) {
                        if (!parte.isBlank()) {
                            sb.append(parte.charAt(0));
                        }
                    }
                    yield sb.toString().toUpperCase();
                }
                yield codigo.length() > 4 ? codigo.substring(0, 4).toUpperCase() : codigo.toUpperCase();
            }
        };
    }

    private int resolverLongitudPorDefecto(String codigo) {
        return switch (codigo) {
            case CorrelativoCodigo.ACTIVO -> 5;
            default -> 4;
        };
    }

    private String construirNumero(
            Correlativo correlativo,
            int numero
    ) {

        String numeroFormateado = String.format(
                "%0"
                                + correlativo.getLongitud()
                                + "d",
                        numero
                );

        if (correlativo.getPrefijo() == null || correlativo.getPrefijo().isBlank()) {
            return correlativo.getGestion() + "-" + numeroFormateado;
        }

        return correlativo.getPrefijo()
                + "-"
                + correlativo.getGestion()
                + "-"
                + numeroFormateado;
    }

    private CorrelativoResponse toResponse(
            Correlativo correlativo
    ) {

        return new CorrelativoResponse(
                correlativo.getId(),
                correlativo.getCodigo(),
                correlativo.getGestion(),
                correlativo.getUltimoNumero(),
                correlativo.getPrefijo(),
                correlativo.getLongitud()
        );
    }
}
