package com.endecorani.sigma_api.modules.parametros.application.service;

import com.endecorani.sigma_api.modules.parametros.domain.model.Correlativo;
import com.endecorani.sigma_api.modules.parametros.domain.repository.CorrelativoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;


@Service
@RequiredArgsConstructor
public class CorrelativoService {

    private final CorrelativoRepository correlativoRepository;

    @Transactional
    public String generar(String codigo) {

        int gestion = Year.now().getValue();

        Correlativo correlativo = correlativoRepository.findForUpdate(codigo, gestion)
                .orElseThrow(() -> new IllegalStateException(
                        "No existe correlativo configurado para " + codigo + " gestión " + gestion));

        int siguienteNumero = correlativo.getUltimoNumero() + 1;

        correlativo.setUltimoNumero(siguienteNumero);

        correlativoRepository.save(correlativo);

        return construirNumero(correlativo, siguienteNumero);
    }

    private String construirNumero(Correlativo correlativo, int numero) {

        String numeroFormateado = String.format("%0" + correlativo.getLongitud() + "d", numero);

        if (correlativo.getPrefijo() == null || correlativo.getPrefijo().isBlank()) {

            return correlativo.getGestion()
                    + "-"
                    + numeroFormateado;
        }

        return correlativo.getPrefijo()
                + "-"
                + correlativo.getGestion()
                + "-"
                + numeroFormateado;
    }
}
