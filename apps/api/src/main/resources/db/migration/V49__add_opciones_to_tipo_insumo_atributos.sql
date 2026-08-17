ALTER TABLE inventarios.tipo_insumo_atributos
    ADD COLUMN IF NOT EXISTS opciones JSONB;
