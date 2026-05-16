// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const dao = new Dao(db)

    // --- Beneficios ---
    const beneficios = dao.findCollectionByNameOrId("beneficios")
    beneficios.viewRule = "@request.auth.id != ''"
    dao.saveCollection(beneficios)

    // --- Publicaciones ---
    const publicaciones = dao.findCollectionByNameOrId("publicaciones")
    publicaciones.viewRule = "@request.auth.id != ''"
    dao.saveCollection(publicaciones)

    // --- Comentarios Beneficios ---
    const comentariosBeneficios = dao.findCollectionByNameOrId("comentarios_beneficios")
    comentariosBeneficios.viewRule =
      "estado = 'aprobado' || usuario = @request.auth.id || @request.auth.rol ~ 'Administrador|Presidente|Directorio'"
    dao.saveCollection(comentariosBeneficios)

    // --- Comentarios Publicaciones ---
    const comentariosPublicaciones = dao.findCollectionByNameOrId("comentarios_publicaciones")
    comentariosPublicaciones.viewRule =
      "estado = 'aprobado' || usuario = @request.auth.id || @request.auth.rol ~ 'Administrador|Presidente|Directorio'"
    dao.saveCollection(comentariosPublicaciones)

    // --- Sugerencias ---
    const sugerencias = dao.findCollectionByNameOrId("sugerencias")
    sugerencias.viewRule = "@request.auth.rol ~ 'Administrador|Presidente|Directorio'"
    dao.saveCollection(sugerencias)

    // --- Notificaciones ---
    const notificaciones = dao.findCollectionByNameOrId("notificaciones")
    notificaciones.viewRule = "usuario = @request.auth.id"
    dao.saveCollection(notificaciones)

    // --- Usos de beneficio ---
    const usos = dao.findCollectionByNameOrId("usos_beneficio")
    usos.viewRule =
      "usuario = @request.auth.id || @request.auth.rol ~ 'Administrador|Presidente|Directorio'"
    dao.saveCollection(usos)

    // --- Asistencias a evento ---
    const asistencias = dao.findCollectionByNameOrId("asistencias_evento")
    asistencias.viewRule =
      "usuario = @request.auth.id || @request.auth.rol ~ 'Administrador|Presidente|Directorio'"
    dao.saveCollection(asistencias)

    return true
  },
  (db) => {
    const dao = new Dao(db)

    // Revertir a vacío (restringido)
    const collections = [
      "beneficios",
      "publicaciones",
      "comentarios_beneficios",
      "comentarios_publicaciones",
      "sugerencias",
      "notificaciones",
      "usos_beneficio",
      "asistencias_evento",
    ]
    for (const name of collections) {
      const col = dao.findCollectionByNameOrId(name)
      col.viewRule = ""
      dao.saveCollection(col)
    }

    return true
  },
)
