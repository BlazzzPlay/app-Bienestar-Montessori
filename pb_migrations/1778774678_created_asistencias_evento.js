/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "fuylsi3b4ubaocl",
    "created": "2026-05-14 16:04:38.547Z",
    "updated": "2026-05-14 16:04:38.547Z",
    "name": "asistencias_evento",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "brma4scw",
        "name": "publicacion",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "crjjr0s2xws761y",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "musqbhzn",
        "name": "usuario",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "8syljtl3",
        "name": "confirmado",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [],
    "listRule": "",
    "viewRule": "",
    "createRule": "usuario = @request.auth.id",
    "updateRule": "usuario = @request.auth.id",
    "deleteRule": "@request.auth.rol = 'Administrador'",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("fuylsi3b4ubaocl");

  return dao.deleteCollection(collection);
})
