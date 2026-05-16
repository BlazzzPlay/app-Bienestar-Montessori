migrate(
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("0ql29ffvryetqbc")

    collection.listRule = "@request.auth.rol ~ 'Administrador|Presidente|Directorio'\n"
    collection.viewRule = "@request.auth.rol ~ 'Administrador|Presidente|Directorio'\n"

    return dao.saveCollection(collection)
  },
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("0ql29ffvryetqbc")

    collection.listRule = "@request.auth.rol ~ 'Administrador|Presidente|Directorio'"
    collection.viewRule = ""

    return dao.saveCollection(collection)
  },
)
