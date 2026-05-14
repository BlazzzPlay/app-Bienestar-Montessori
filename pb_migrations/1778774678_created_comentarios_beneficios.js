/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "pa2rskzlx283ecx",
    "created": "2026-05-14 16:04:38.365Z",
    "updated": "2026-05-14 16:04:38.365Z",
    "name": "comentarios_beneficios",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "jvacxtva",
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
        "id": "khxiolvy",
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
        "id": "adgbbooh",
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
        "id": "amsadkfc",
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
        "id": "zuf05wyd",
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
  const collection = dao.findCollectionByNameOrId("pa2rskzlx283ecx");

  return dao.deleteCollection(collection);
})
