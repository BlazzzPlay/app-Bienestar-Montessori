migrate(
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

    // Any authenticated user can list and view all users (directorio, profiles, etc.)
    collection.listRule = "@request.auth.id != ''"
    collection.viewRule = "@request.auth.id != ''"

    return dao.saveCollection(collection)
  },
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

    collection.listRule = ""
    collection.viewRule = ""

    return dao.saveCollection(collection)
  },
)
