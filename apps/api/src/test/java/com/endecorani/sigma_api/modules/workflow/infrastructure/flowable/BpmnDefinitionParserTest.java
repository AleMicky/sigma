package com.endecorani.sigma_api.modules.workflow.infrastructure.flowable;

import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowActionResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BpmnDefinitionParserTest {

    private BpmnDefinitionParser parser;
    private String bpmnXml;

    @BeforeEach
    void setUp() throws Exception {
        parser = new BpmnDefinitionParser();
        try (InputStream is = getClass().getResourceAsStream("/processes/solicitudMantenimientoProcess.bpmn20.xml")) {
            assertNotNull(is, "El archivo BPMN debe existir en resources");
            bpmnXml = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @Test
    void testRevisarSolicitudAcciones() {
        List<WorkflowActionResponse> actions = parser.obtenerAcciones(bpmnXml, "revisarSolicitud");
        assertFalse(actions.isEmpty(), "revisarSolicitud debe tener acciones");
        assertEquals(2, actions.size());
        assertTrue(actions.stream().anyMatch(a -> a.name().equalsIgnoreCase("Aprobar")));
        assertTrue(actions.stream().anyMatch(a -> a.name().equalsIgnoreCase("Observar")));
    }

    @Test
    void testIniciarMantenimientoAcciones() {
        List<WorkflowActionResponse> actions = parser.obtenerAcciones(bpmnXml, "iniciarMantenimiento");
        assertFalse(actions.isEmpty(), "iniciarMantenimiento debe tener acciones directas");
        assertEquals("Iniciar mantenimiento", actions.getFirst().name());
    }

    @Test
    void testEnviarRevisionAcciones() {
        List<WorkflowActionResponse> actions = parser.obtenerAcciones(bpmnXml, "enviarRevision");
        assertFalse(actions.isEmpty(), "enviarRevision debe tener acciones");
        assertEquals("Enviar a revisión", actions.getFirst().name());
    }
}
