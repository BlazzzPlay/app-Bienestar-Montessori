/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "0ql29ffvryetqbc",
    "created": "2026-05-14 16:02:38.345Z",
    "updated": "2026-05-14 16:02:38.345Z",
    "name": "sugerencias",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "fobfflnh",
        "name": "contenido",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "qsyfhoyh",
        "name": "fecha_creacion",
        "type": "date",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "cd5tkief",
        "name": "leido",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.rol ~ 'Administrador|Presidente|Directorio'",
    "viewRule": "",
    "createRule": "",
    "updateRule": "@request.auth.rol ~ 'Administrador|Presidente|Directorio'",
    "deleteRule": "",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("0ql29ffvryetqbc");

  return dao.deleteCollection(collection);
})
