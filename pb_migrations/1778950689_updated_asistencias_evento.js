migrate(
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("fuylsi3b4ubaocl")

    collection.listRule =
      "usuario = @request.auth.id || @request.auth.rol ~ 'Administrador|Presidente|Directorio'"
    collection.viewRule =
      "usuario = @request.auth.id || @request.auth.rol ~ 'Administrador|Presidente|Directorio'"

    return dao.saveCollection(collection)
  },
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("fuylsi3b4ubaocl")

    collection.listRule = ""
    collection.viewRule = ""

    return dao.saveCollection(collection)
  },
)
