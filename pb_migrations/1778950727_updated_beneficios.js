migrate(
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("r57koyvr9dr169m")

    collection.listRule = "@request.auth.id != ''\n"
    collection.viewRule = "@request.auth.id != ''\n"

    return dao.saveCollection(collection)
  },
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("r57koyvr9dr169m")

    collection.listRule = ""
    collection.viewRule = ""

    return dao.saveCollection(collection)
  },
)
