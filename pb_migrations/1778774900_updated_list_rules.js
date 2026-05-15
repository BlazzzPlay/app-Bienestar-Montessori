// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const dao = new Dao(db)

    // Beneficios — cualquier usuario autenticado puede ver
    const beneficios = dao.findCollectionByNameOrId("beneficios")
    beneficios.listRule = "@request.auth.id != ''"
    dao.saveCollection(beneficios)

    // Publicaciones — cualquier usuario autenticado puede ver
    const publicaciones = dao.findCollectionByNameOrId("publicaciones")
    publicaciones.listRule = "@request.auth.id != ''"
    dao.saveCollection(publicaciones)

    // Usos de beneficio — el propio usuario o admin
    const usos = dao.findCollectionByNameOrId("usos_beneficio")
    usos.listRule =
      "usuario = @request.auth.id || @request.auth.rol ~ 'Administrador|Presidente|Directorio'"
    dao.saveCollection(usos)

    // Asistencias a evento — el propio usuario o admin
    const asistencias = dao.findCollectionByNameOrId("asistencias_evento")
    asistencias.listRule =
      "usuario = @request.auth.id || @request.auth.rol ~ 'Administrador|Presidente|Directorio'"
    dao.saveCollection(asistencias)

    return true
  },
  (db) => {
    const dao = new Dao(db)

    // Revertir a vacío (restringido)
    const collections = ["beneficios", "publicaciones", "usos_beneficio", "asistencias_evento"]
    for (const name of collections) {
      const col = dao.findCollectionByNameOrId(name)
      col.listRule = ""
      dao.saveCollection(col)
    }

    return true
  },
)
