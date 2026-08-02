CREATE UNIQUE INDEX uk_catalogo_items_catalogo_orden
    ON parametros.catalogo_items (catalogo_id, orden);
