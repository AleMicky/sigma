package com.endecorani.sigma_api.shared.util;

import java.util.Set;

public final class ApiConstants {
    private ApiConstants() {}

    public static final String API_BASE_PATH = "/api";
    public static final String API_VERSION = "/v1";
    public static final String API_V1 = API_BASE_PATH + API_VERSION;

    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;

    public static final String DEFAULT_SORT_FIELD = "createdAt";
    public static final String DEFAULT_SORT_DIRECTION = "DESC";

    public static final Set<String> BASE_SORT_FIELDS = Set.of(
            "id",
            "createdAt",
            "updatedAt"
    );
}
