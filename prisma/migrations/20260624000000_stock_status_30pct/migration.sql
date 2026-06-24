-- Recalcula o status de criticidade do item de estoque.
-- Critério de aceite (#7): 'critical' quando a quantidade atual for menor que
-- 30% do estoque mínimo. Mantém o tier 'low' até 120% do mínimo.
-- O trigger trg_set_stock_status (BEFORE INSERT/UPDATE) já existe; aqui só
-- substituímos a função que ele executa.
CREATE OR REPLACE FUNCTION set_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW."status" := CASE
    WHEN NEW."currentQuantity" < NEW."minQuantity" * 0.3   THEN 'critical'::"StockStatus"
    WHEN NEW."currentQuantity" <= NEW."minQuantity" * 1.2  THEN 'low'::"StockStatus"
    ELSE 'ok'::"StockStatus"
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
