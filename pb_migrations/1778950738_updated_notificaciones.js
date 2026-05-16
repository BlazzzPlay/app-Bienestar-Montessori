migrate(
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("cze2pa2c1blwfdy")

    collection.listRule = "usuario = @request.auth.id\n"
    collection.viewRule = "usuario = @request.auth.id\n"

    return dao.saveCollection(collection)
  },
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("cze2pa2c1blwfdy")

    collection.listRule = "usuario = @request.auth.id"
    collection.viewRule = ""

    return dao.saveCollection(collection)
  },
)
