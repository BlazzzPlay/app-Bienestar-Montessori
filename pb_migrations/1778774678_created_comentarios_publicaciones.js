/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "cw47gy5bec5juud",
    "created": "2026-05-14 16:04:38.456Z",
    "updated": "2026-05-14 16:04:38.456Z",
    "name": "comentarios_publicaciones",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "nwbxggfw",
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
        "id": "hnoidzij",
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
        "id": "rjaqpuru",
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
        "id": "l7jtjrgp",
        "name": "estado",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "pendiente",
            "aprobado",
            "archivado"
          ]
        }
      },
      {
        "system": false,
        "id": "ivyx5t2u",
        "name": "fecha_creacion",
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
    "listRule": "estado = 'aprobado' || usuario = @request.auth.id || @request.auth.rol ~ 'Administrador|Presidente|Directorio'",
    "viewRule": "",
    "createRule": "usuario = @request.auth.id",
    "updateRule": "@request.auth.rol ~ 'Administrador|Presidente|Directorio'",
    "deleteRule": "@request.auth.rol = 'Administrador'",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("cw47gy5bec5juud");

  return dao.deleteCollection(collection);
})
