-- =============================================================================
-- CHECK STATE
-- Run this to see if the "Bad Trigger" is still alive.
-- =============================================================================

SELECT 
    trigger_schema, 
    trigger_name, 
    event_manipulation, 
    event_object_table, 
    action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';
