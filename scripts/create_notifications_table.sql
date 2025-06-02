-- Eliminar tabla existente si hay problemas de esquema
DROP TABLE IF EXISTS notificaciones CASCADE;

-- Crear tabla de notificaciones con el esquema correcto
CREATE TABLE notificaciones (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  action_text TEXT,
  action_url TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_notificaciones_user_id ON notificaciones(user_id);
CREATE INDEX idx_notificaciones_status ON notificaciones(status);
CREATE INDEX idx_notificaciones_created_at ON notificaciones(created_at DESC);
CREATE INDEX idx_notificaciones_expires_at ON notificaciones(expires_at);
CREATE INDEX idx_notificaciones_user_status ON notificaciones(user_id, status);

-- Insertar algunas notificaciones de ejemplo para testing
INSERT INTO notificaciones (
  id, user_id, template_id, type, title, message, icon, color, 
  action_text, action_url, priority, status, expires_at
) VALUES 
(
  'welcome_user-1_' || extract(epoch from now()),
  'user-1',
  'welcome_new_user',
  'welcome',
  '¡Bienvenido a Bienestar Montessori!',
  'Te damos la bienvenida a tu portal de beneficios. Aquí podrás acceder a todos los convenios, eventos y servicios disponibles para el personal del colegio.',
  '👋',
  'bg-blue-500',
  'Explorar Beneficios',
  '/beneficios',
  'medium',
  'unread',
  NOW() + INTERVAL '7 days'
),
(
  'feature_dev_user-2_' || extract(epoch from now()),
  'user-2',
  'feature_under_development',
  'feature_development',
  'Funcionalidad en Desarrollo',
  'Algunas funciones están temporalmente restringidas mientras realizamos mejoras. Solo los administradores tienen acceso completo durante esta fase.',
  '🚧',
  'bg-orange-500',
  'Ver Mi Perfil',
  '/perfil',
  'medium',
  'unread',
  NOW() + INTERVAL '1 day'
),
(
  'system_maintenance_' || extract(epoch from now()),
  'user-1',
  'system_maintenance',
  'system',
  'Mantenimiento Programado',
  'El sistema estará en mantenimiento el próximo domingo de 2:00 a 6:00 AM. Durante este tiempo, algunas funciones podrían no estar disponibles.',
  '⚙️',
  'bg-gray-500',
  NULL,
  NULL,
  'low',
  'unread',
  NOW() + INTERVAL '2 days'
);
