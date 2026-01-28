-- =============================================================================
-- DEEP DIAGNOSTIC - ALL TRIGGERS
-- =============================================================================

SELECT 
    event_object_schema as table_schema,
    event_object_table as table_name,
    trigger_schema,
    trigger_name
FROM information_schema.triggers
WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;
