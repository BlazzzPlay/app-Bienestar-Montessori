migrate(
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("asistencias_evento")

    // Allow users to see their own attendance + admin/presidente/directorio can see all
    collection.listRule =
      "usuario = @request.auth.id || @request.auth.rol ~ 'Administrador|Presidente|Directorio'"
    collection.viewRule =
      "usuario = @request.auth.id || @request.auth.rol ~ 'Administrador|Presidente|Directorio'"

    return dao.saveCollection(collection)
  },
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("asistencias_evento")

    collection.listRule = ""
    collection.viewRule = ""

    return dao.saveCollection(collection)
  },
)
