-- ============================================
-- Test: enviar_notificacion_broadcast
-- ============================================

-- Setup: create test users if they don't exist
-- (run in a transaction and rollback to keep DB clean)
begin;

-- Verify function exists
select proname from pg_proc where proname = 'enviar_notificacion_broadcast';

-- Test 1: broadcast to a specific role
-- (requires at least one user with rol = 'Visualizador' in perfiles)
select enviar_notificacion_broadcast(
  'Test broadcast por rol',
  'Este es un mensaje de prueba para un rol específico.',
  'sistema',
  'Visualizador',
  'normal',
  null,
  null,
  null,
  null,
  null
);

-- Verify rows were inserted
select count(*) as count_por_rol from public.notificaciones where titulo = 'Test broadcast por rol';

-- Test 2: broadcast to all users
select enviar_notificacion_broadcast(
  'Test broadcast global',
  'Este es un mensaje de prueba para todos.',
  'sistema',
  null,
  'normal',
  null,
  null,
  null,
  null,
  null
);

-- Verify rows were inserted
select count(*) as count_global from public.notificaciones where titulo = 'Test broadcast global';

-- Test 3: verify 500-user cap
-- This would raise an exception if >500 users exist and you try global broadcast.
-- To test the cap, you can temporarily insert dummy rows into perfiles:
-- (uncomment below to test, but be careful in production)
-- insert into public.perfiles (id, correo, rol, es_bienestar)
-- select gen_random_uuid(), 'dummy' || n || '@test.cl', 'Visualizador', false
-- from generate_series(1, 501) as n;
--
-- select enviar_notificacion_broadcast('Cap test', 'msg', 'sistema', null);
-- -- Should raise: 'Demasiados destinatarios. Máximo 500 usuarios para broadcast global.'

rollback;
