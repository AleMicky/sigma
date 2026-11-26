package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.ActivoAtributosReplacementRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoAtributoValorResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAtributo;
import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAtributoValor;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.parametros.domain.model.TipoDato;
import com.endecorani.sigma_api.modules.parametros.domain.repository.TipoDatoRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivoAtributosReplacementServiceTest {

    @Mock
    private ActivoAtributoValorRepository valorRepository;

    @Mock
    private ActivoRepository activoRepository;

    @Mock
    private ActivoAtributoRepository activoAtributoRepository;

    @Mock
    private TipoDatoRepository tipoDatoRepository;

    @Mock
    private JsonMapper jsonMapper;

    @InjectMocks
    private ActivoAtributoValorService service;

    @Test
    void replaceValores_guardaConjuntoCompletoDespuesDeBorrarLosPrevios() {
        UUID activoId = UUID.randomUUID();
        UUID tipoId = UUID.randomUUID();
        UUID tipoDatoId = UUID.randomUUID();
        UUID requeridoId = UUID.randomUUID();
        UUID opcionalId = UUID.randomUUID();

        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activo(activoId, tipoId)));
        when(activoAtributoRepository.findByTipoActivoId(tipoId)).thenReturn(List.of(
                atributo(requeridoId, tipoId, tipoDatoId, "COLOR", true),
                atributo(opcionalId, tipoId, tipoDatoId, "OBS", false)
        ));
        when(activoAtributoRepository.findById(requeridoId))
                .thenReturn(Optional.of(atributo(requeridoId, tipoId, tipoDatoId, "COLOR", true)));
        when(activoAtributoRepository.findById(opcionalId))
                .thenReturn(Optional.of(atributo(opcionalId, tipoId, tipoDatoId, "OBS", false)));
        when(tipoDatoRepository.findById(tipoDatoId))
                .thenReturn(Optional.of(TipoDato.builder().id(tipoDatoId).codigo("TEXT").build()));
        when(valorRepository.save(any(ActivoAtributoValor.class))).thenAnswer(invocation -> {
            ActivoAtributoValor valor = invocation.getArgument(0);
            valor.setId(UUID.randomUUID());
            return valor;
        });

        List<ActivoAtributoValorResponse> responses = service.replaceValores(
                activoId,
                new ActivoAtributosReplacementRequest(List.of(
                        new ActivoAtributosReplacementRequest.AtributoValorItem(requeridoId, "AZUL"),
                        new ActivoAtributosReplacementRequest.AtributoValorItem(opcionalId, " Observación ")
                ))
        );

        assertEquals(2, responses.size());

        InOrder inOrder = inOrder(valorRepository);
        inOrder.verify(valorRepository).deleteAllByActivoId(activoId);
        inOrder.verify(valorRepository, times(2)).save(any(ActivoAtributoValor.class));
        inOrder.verifyNoMoreInteractions();

        org.mockito.ArgumentCaptor<ActivoAtributoValor> guardados =
                org.mockito.ArgumentCaptor.forClass(ActivoAtributoValor.class);
        verify(valorRepository, times(2)).save(guardados.capture());
        assertEquals("AZUL", guardados.getAllValues().get(0).getValor());
        assertEquals("Observación", guardados.getAllValues().get(1).getValor());
        // El reemplazo no debe ejecutar la validación de unicidad del alta suelta.
        verify(valorRepository, never()).existsByActivoIdAndActivoAtributoId(any(), any());
    }

    @Test
    void replaceValores_faltaAtributoRequerido_noBorraNiGuarda() {
        UUID activoId = UUID.randomUUID();
        UUID tipoId = UUID.randomUUID();
        UUID tipoDatoId = UUID.randomUUID();
        UUID requeridoId = UUID.randomUUID();

        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activo(activoId, tipoId)));
        when(activoAtributoRepository.findByTipoActivoId(tipoId))
                .thenReturn(List.of(atributo(requeridoId, tipoId, tipoDatoId, "COLOR", true)));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.replaceValores(
                        activoId,
                        new ActivoAtributosReplacementRequest(List.of())
                )
        );

        assertEquals("ATRIBUTOS_REQUERIDOS_FALTANTES", exception.getCode());
        verify(valorRepository, never()).deleteAllByActivoId(any());
        verify(valorRepository, never()).save(any());
    }

    @Test
    void replaceValores_valorInvalido_noBorraLosValoresPrevios() {
        UUID activoId = UUID.randomUUID();
        UUID tipoId = UUID.randomUUID();
        UUID tipoDatoId = UUID.randomUUID();
        UUID atributoId = UUID.randomUUID();
        UUID otroTipoId = UUID.randomUUID();

        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activo(activoId, tipoId)));
        when(activoAtributoRepository.findByTipoActivoId(tipoId)).thenReturn(List.of());
        when(activoAtributoRepository.findById(atributoId))
                .thenReturn(Optional.of(atributo(atributoId, otroTipoId, tipoDatoId, "COLOR", false)));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.replaceValores(
                        activoId,
                        new ActivoAtributosReplacementRequest(List.of(
                                new ActivoAtributosReplacementRequest.AtributoValorItem(atributoId, "AZUL")
                        ))
                )
        );

        assertEquals("ACTIVO_ATRIBUTO_TIPO_MISMATCH", exception.getCode());
        verify(valorRepository, never()).deleteAllByActivoId(any());
        verify(valorRepository, never()).save(any());
    }

    @Test
    void replaceValores_atributoDuplicado_lanzaConflictoSinTocarLaBase() {
        UUID activoId = UUID.randomUUID();
        UUID tipoId = UUID.randomUUID();
        UUID atributoId = UUID.randomUUID();

        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activo(activoId, tipoId)));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.replaceValores(
                        activoId,
                        new ActivoAtributosReplacementRequest(List.of(
                                new ActivoAtributosReplacementRequest.AtributoValorItem(atributoId, "A"),
                                new ActivoAtributosReplacementRequest.AtributoValorItem(atributoId, "B")
                        ))
                )
        );

        assertEquals("ATRIBUTO_DUPLICADO_EN_VALORES", exception.getCode());
        verify(valorRepository, never()).deleteAllByActivoId(any());
    }

    private static Activo activo(UUID id, UUID tipoId) {
        return Activo.builder()
                .id(id)
                .codigo("ACT-001")
                .nombre("Activo de prueba")
                .tipoActivoId(tipoId)
                .activo(true)
                .build();
    }

    private static ActivoAtributo atributo(
            UUID id,
            UUID tipoId,
            UUID tipoDatoId,
            String codigo,
            boolean requerido
    ) {
        return ActivoAtributo.builder()
                .id(id)
                .tipoActivoId(tipoId)
                .tipoDatoId(tipoDatoId)
                .codigo(codigo)
                .requerido(requerido)
                .build();
    }
}
