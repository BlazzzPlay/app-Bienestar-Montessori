migrate(
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("publicaciones")

    collection.schema.addField(
      new SchemaField({
        system: false,
        id: "cupo_maximo",
        name: "cupo_maximo",
        type: "number",
        required: false,
        presentable: false,
        unique: false,
        options: {
          min: 0,
          max: null,
          noDecimal: true,
        },
      }),
    )

    return dao.saveCollection(collection)
  },
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("publicaciones")

    collection.schema.removeField("cupo_maximo")

    return dao.saveCollection(collection)
  },
)
