migrate(
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("crjjr0s2xws761y")

    collection.listRule = "@request.auth.id != ''\n"
    collection.viewRule = "@request.auth.id != ''\n"

    return dao.saveCollection(collection)
  },
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("crjjr0s2xws761y")

    collection.listRule = ""
    collection.viewRule = ""

    return dao.saveCollection(collection)
  },
)
