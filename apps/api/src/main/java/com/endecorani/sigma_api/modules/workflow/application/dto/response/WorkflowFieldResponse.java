package com.endecorani.sigma_api.modules.workflow.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowFieldResponse {

    private String id;
    private String name;
    private String type;
    private Boolean required;
    private Boolean readable;
    private Boolean writable;
    private List<WorkflowFieldOptionResponse> options;

    private String component;
    private String source;
    private String url;
    private Map<String, String> params;

    public String id() {
        return id;
    }

    public String name() {
        return name;
    }

    public String type() {
        return type;
    }

    public Boolean required() {
        return required;
    }

    public Boolean readable() {
        return readable;
    }

    public Boolean writable() {
        return writable;
    }
}