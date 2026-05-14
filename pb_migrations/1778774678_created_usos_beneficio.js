/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "f4kwoiaccw036dn",
    "created": "2026-05-14 16:04:38.644Z",
    "updated": "2026-05-14 16:04:38.644Z",
    "name": "usos_beneficio",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "1fnfyrak",
        "name": "beneficio",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "r57koyvr9dr169m",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "e9lpmu9e",
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
        "id": "ee6nsakh",
        "name": "fecha_uso",
        "type": "date",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      }
    ],
    "indexes": [],
    "listRule": "",
    "viewRule": "",
    "createRule": "usuario = @request.auth.id",
    "updateRule": "",
    "deleteRule": "@request.auth.rol = 'Administrador'",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("f4kwoiaccw036dn");

  return dao.deleteCollection(collection);
})
