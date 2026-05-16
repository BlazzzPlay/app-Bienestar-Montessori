migrate(
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("f4kwoiaccw036dn")

    collection.listRule =
      "usuario = @request.auth.id || @request.auth.rol ~ 'Administrador|Presidente|Directorio'\n"
    collection.viewRule =
      "usuario = @request.auth.id || @request.auth.rol ~ 'Administrador|Presidente|Directorio'\n"

    return dao.saveCollection(collection)
  },
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("f4kwoiaccw036dn")

    collection.listRule = ""
    collection.viewRule = ""

    return dao.saveCollection(collection)
  },
)
