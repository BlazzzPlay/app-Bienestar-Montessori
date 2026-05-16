migrate(
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("beneficios")

    collection.schema.addField(
      new SchemaField({
        system: false,
        id: "instagram_url",
        name: "instagram_url",
        type: "url",
        required: false,
        presentable: false,
        unique: false,
        options: {
          exceptDomains: [],
          onlyDomains: ["instagram.com", "www.instagram.com"],
        },
      }),
    )

    collection.schema.addField(
      new SchemaField({
        system: false,
        id: "website_url",
        name: "website_url",
        type: "url",
        required: false,
        presentable: false,
        unique: false,
        options: {
          exceptDomains: [],
          onlyDomains: [],
        },
      }),
    )

    return dao.saveCollection(collection)
  },
  (db) => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId("beneficios")

    collection.schema.removeField("instagram_url")
    collection.schema.removeField("website_url")

    return dao.saveCollection(collection)
  },
)
