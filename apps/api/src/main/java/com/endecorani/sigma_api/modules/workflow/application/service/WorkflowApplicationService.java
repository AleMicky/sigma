package com.endecorani.sigma_api.modules.workflow.application.service;

import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.domain.model.Workflow;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class WorkflowApplicationService {

    private final WorkflowConfigService workflowConfigService;
    private final WorkflowEngineService workflowEngineService;

    public String iniciar(
            String workflowCodigo,
            String businessKey,
            Map<String, Object> variables
    ) {

        Workflow workflow = workflowConfigService.findDomainByCodigo(workflowCodigo);

        return workflowEngineService.iniciarProceso(
                workflow.getProcessDefinitionKey(),
                businessKey,
                variables
        );
    }

    public WorkflowTaskResponse obtenerTareaActual(
            String processInstanceId
    ) {

        return workflowEngineService
                .obtenerTareaActual(
                        processInstanceId
                );
    }

    public WorkflowTaskActionsResponse obtenerAccionesDisponibles(
            String processInstanceId
    ) {
        return workflowEngineService
                .obtenerAccionesDisponibles(
                        processInstanceId
                );
    }
}