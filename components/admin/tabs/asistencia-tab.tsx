"use client"

import { useState } from "react"
import { Users, CalendarDays, UserCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { EventoConAsistencia } from "@/hooks/useAdmin"

interface AsistenciaTabProps {
  eventos: EventoConAsistencia[]
}

export default function AsistenciaTab({ eventos }: AsistenciaTabProps) {
  const [selectedEventoId, setSelectedEventoId] = useState<string>(
    eventos[0]?.evento.id.toString() || "",
  )

  const selected = eventos.find((e) => e.evento.id.toString() === selectedEventoId)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedEventoId} onValueChange={setSelectedEventoId}>
          <SelectTrigger className="w-full max-w-sm rounded-lg" aria-label="Seleccionar evento">
            <SelectValue placeholder="Seleccionar evento" />
          </SelectTrigger>
          <SelectContent>
            {eventos.map((e) => (
              <SelectItem key={e.evento.id} value={e.evento.id.toString()}>
                {e.evento.titulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Confirmados</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {selected.asistentes} asistente{selected.asistentes !== 1 ? "s" : ""}
            </Badge>
          </div>

          <Progress
            value={Math.min(selected.asistentes * 10, 100)}
            className="h-2"
            aria-label={`Progreso de asistencia: ${selected.asistentes} confirmados`}
          />

          {selected.confirmados.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selected.confirmados.map((c, idx) => (
                <Card key={idx} className="border-0 shadow-sm">
                  <CardContent className="p-3 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {c.nombre
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate">{c.nombre}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <Users className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground">Nadie ha confirmado asistencia aún</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 space-y-2">
          <CalendarDays className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground">No hay eventos disponibles</p>
        </div>
      )}
    </div>
  )
}
