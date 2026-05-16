migrate(
  (db) => {
    // Step 1: Clean up duplicate records
    // Keep only one record per (publicacion, usuario) pair (MIN(id) = first created,
    // since PocketBase IDs are k-sorted). Then the unique index prevents future dupes.
    db.newQuery(
      "DELETE FROM asistencias_evento WHERE id NOT IN (SELECT MIN(id) FROM asistencias_evento GROUP BY publicacion, usuario)",
    ).execute()

    // Step 2: Add unique index to prevent future duplicates
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("fuylsi3b4ubaocl")

    collection.indexes = collection.indexes.filter(
      (i) => !i.includes("idx_asistencias_evento_unique"),
    )
    collection.indexes.push(
      "CREATE UNIQUE INDEX idx_asistencias_evento_unique ON asistencias_evento (publicacion, usuario)",
    )

    return dao.saveCollection(collection)
  },
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("fuylsi3b4ubaocl")

    collection.indexes = collection.indexes.filter(
      (i) => !i.includes("idx_asistencias_evento_unique"),
    )

    return dao.saveCollection(collection)
  },
)
