"use client"

import { useEffect } from "react"
import {
  Users,
  Gift,
  CalendarDays,
  MessageSquare,
  BarChart3,
  Settings,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { useAdmin } from "@/hooks/useAdmin"
import { useRouter } from "next/navigation"
import DevelopmentGuard from "@/components/development-guard"

export default function AdminPage() {
  const { profile, hasFullAccess } = useAuth()
  const { estadisticas, loading } = useAdmin()
  const router = useRouter()

  // Verificar acceso de administrador
  useEffect(() => {
    if (profile && !hasFullAccess()) {
      router.push("/perfil")
      return
    }
  }, [profile, hasFullAccess, router])

  if (!profile || !hasFullAccess()) {
    return (
      <DevelopmentGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
              <p className="text-gray-600">Solo los administradores pueden acceder a este panel.</p>
              <Button
                onClick={() => router.push("/perfil")}
                className="mt-4 bg-primary hover:bg-primary/90"
              >
                Volver al Perfil
              </Button>
            </CardContent>
          </Card>
        </div>
      </DevelopmentGuard>
    )
  }

  if (loading) {
    return (
      <DevelopmentGuard>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-2xl space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </DevelopmentGuard>
    )
  }

  return (
    <DevelopmentGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600 mt-1">Gestiona el programa de Bienestar Montessori</p>
              <p className="text-sm text-green-600 mt-1">✅ Modo Local - Datos de ejemplo</p>
            </div>
            <Button
              onClick={() => router.push("/perfil")}
              variant="outline"
              className="border-gray-300"
            >
              Volver al Perfil
            </Button>
          </div>
        </header>

        <div className="p-4 pb-20">
          {/* Estadísticas Generales */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.totalUsuarios}</p>
                    <p className="text-sm text-gray-600">Usuarios Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {estadisticas.usuariosBienestar}
                    </p>
                    <p className="text-sm text-gray-600">En Bienestar</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Gift className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {estadisticas.totalBeneficios}
                    </p>
                    <p className="text-sm text-gray-600">Beneficios</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.totalEventos}</p>
                    <p className="text-sm text-gray-600">Eventos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-8 w-8 text-amber-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {estadisticas.comentariosPendientes}
                    </p>
                    <p className="text-sm text-gray-600">Comentarios</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {estadisticas.sugerenciasNoLeidas}
                    </p>
                    <p className="text-sm text-gray-600">Sugerencias</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información de Integración */}
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-semibold text-green-800">Modo Local Activo</h3>
                  <p className="text-sm text-green-700">
                    La aplicación está funcionando en modo local con datos de ejemplo. Todos los
                    cambios se guardan en el navegador.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resto del contenido del panel... */}
          <Tabs defaultValue="usuarios" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
              <TabsTrigger value="beneficios">Beneficios</TabsTrigger>
              <TabsTrigger value="eventos">Eventos</TabsTrigger>
              <TabsTrigger value="sugerencias">Sugerencias</TabsTrigger>
            </TabsList>

            {/* Tab de Usuarios */}
            <TabsContent value="usuarios" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Gestión de Usuarios</span>
                    </span>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-1" />
                      Nuevo Usuario
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Gestión de usuarios</p>
                        <p className="text-sm text-gray-600">
                          Ver, editar y gestionar todos los usuarios del sistema
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Todos
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Usuarios de Bienestar</p>
                        <p className="text-sm text-gray-600">
                          Gestionar quién pertenece al programa de bienestar
                        </p>
                      </div>
                      <Badge className="bg-green-600 text-white">
                        {estadisticas.usuariosBienestar} activos
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab de Beneficios */}
            <TabsContent value="beneficios" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <Gift className="h-5 w-5" />
                      <span>Gestión de Beneficios</span>
                    </span>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-1" />
                      Nuevo Beneficio
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Beneficios Activos</p>
                        <p className="text-sm text-gray-600">
                          Gestionar convenios y descuentos disponibles
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Todos
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Estadísticas
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab de Eventos */}
            <TabsContent value="eventos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <CalendarDays className="h-5 w-5" />
                      <span>Gestión de Eventos</span>
                    </span>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-1" />
                      Nuevo Evento
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Eventos y Noticias</p>
                        <p className="text-sm text-gray-600">
                          Crear y gestionar eventos del programa de bienestar
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Todos
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab de Sugerencias */}
            <TabsContent value="sugerencias" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>Buzón de Sugerencias</span>
                    </span>
                    {estadisticas.sugerenciasNoLeidas > 0 && (
                      <Badge className="bg-red-500 text-white">
                        {estadisticas.sugerenciasNoLeidas} nuevas
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Sugerencias Recibidas</p>
                        <p className="text-sm text-gray-600">
                          Revisar y gestionar sugerencias anónimas
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Todas
                        </Button>
                        {estadisticas.sugerenciasNoLeidas > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-primary border-primary"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Marcar Leídas
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Acciones Rápidas */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Acciones Rápidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="h-16 flex flex-col space-y-1">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-xs">Reportes</span>
                </Button>

                <Button variant="outline" className="h-16 flex flex-col space-y-1">
                  <Settings className="h-5 w-5" />
                  <span className="text-xs">Configuración</span>
                </Button>

                <Button variant="outline" className="h-16 flex flex-col space-y-1">
                  <Users className="h-5 w-5" />
                  <span className="text-xs">Exportar Datos</span>
                </Button>

                <Button variant="outline" className="h-16 flex flex-col space-y-1">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs">Notificaciones</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DevelopmentGuard>
  )
}
