migrate(
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("fuylsi3b4ubaocl")

    collection.indexes = [
      "CREATE UNIQUE INDEX `idx_asistencias_evento_unique` ON `asistencias_evento` (\n  `publicacion`,\n  `usuario`\n)",
    ]

    return dao.saveCollection(collection)
  },
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("fuylsi3b4ubaocl")

    collection.indexes = []

    return dao.saveCollection(collection)
  },
)
