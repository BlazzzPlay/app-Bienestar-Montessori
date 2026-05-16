migrate(
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("pa2rskzlx283ecx")

    collection.listRule =
      "estado = 'aprobado' || usuario = @request.auth.id || @request.auth.rol ~ 'Administrador|Presidente|Directorio'\n"
    collection.viewRule =
      "estado = 'aprobado' || usuario = @request.auth.id || @request.auth.rol ~ 'Administrador|Presidente|Directorio'\n"

    return dao.saveCollection(collection)
  },
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("pa2rskzlx283ecx")

    collection.listRule =
      "estado = 'aprobado' || usuario = @request.auth.id || @request.auth.rol ~ 'Administrador|Presidente|Directorio'"
    collection.viewRule = ""

    return dao.saveCollection(collection)
  },
)
