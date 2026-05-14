/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "crjjr0s2xws761y",
    "created": "2026-05-14 16:02:37.987Z",
    "updated": "2026-05-14 16:02:37.987Z",
    "name": "publicaciones",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "9mltthji",
        "name": "titulo",
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
        "id": "ln9jmval",
        "name": "descripcion",
        "type": "editor",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "convertUrls": false
        }
      },
      {
        "system": false,
        "id": "1mfyomvm",
        "name": "fecha_publicacion",
        "type": "date",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "y5gphdjy",
        "name": "categoria",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "Evento",
            "Noticia",
            "Comunicado"
          ]
        }
      },
      {
        "system": false,
        "id": "mqmfwi7o",
        "name": "autor",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "hmqgphpo",
        "name": "lugar",
        "type": "text",
        "required": false,
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
        "id": "zbqkwdec",
        "name": "organizador",
        "type": "text",
        "required": false,
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
        "id": "qgetwfqe",
        "name": "imagen",
        "type": "file",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "mimeTypes": [
            "image/jpeg",
            "image/png",
            "image/webp"
          ],
          "thumbs": [
            "800x400"
          ],
          "maxSelect": 1,
          "maxSize": 5242880,
          "protected": false
        }
      }
    ],
    "indexes": [],
    "listRule": "",
    "viewRule": "",
    "createRule": "@request.auth.id != '' && @request.auth.rol ~ 'Administrador|Presidente|Directorio'",
    "updateRule": "@request.auth.id != '' && @request.auth.rol ~ 'Administrador|Presidente|Directorio'",
    "deleteRule": "@request.auth.id != '' && @request.auth.rol = 'Administrador'",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("crjjr0s2xws761y");

  return dao.deleteCollection(collection);
})
