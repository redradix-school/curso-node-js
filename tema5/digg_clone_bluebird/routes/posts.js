var express = require('express');
var auth = require('../simpleauth');

var Post = require('../models').post;

var postsController = {
  // GET /?s=hottest|recent[&page=n]
  // Devuelve la lista de posts ordenada según la sección y paginada
  index: function(req, res) {
    // TODO
  },
  // GET /xxxxxx
  // Devuelve los datos de un post concreto
  show: function(req, res) {
    // TODO
  },
  // POST /
  // guarda un nuevo post
  create: function(req, res) {
    var postData = req.body;
    // TODO:
    // guardar el usuario que lo crea como documento incrustado user
    // generar la fecha actual
    // guardar el Post y devolverlo como respuesta
  },
  // Actualizar un post (no se usa)
  update: function(req, res) {
  },
  // Borrar un post (no se usa)
  "delete": function(req, res) {
  },
  // Añadir un voto positivo o negativo a un post
  vote: function(req, res) {
    // TODO: decidir si sumamos o restamos voto y guardar el post
  },
  // Lee de BBDD un Post a partir del postId
  param: function(req, res, next, postId) {
    // TODO: leer el Post y guardarlo en req.post
    // o devolver un 404 si no existe
  }
};

var router = express.Router();
router.use(auth.requiresToken);

router.param('postId', postsController.param);
router.get('/', postsController.index);
router.post('/', postsController.create);
router.get('/:postId', postsController.show);
router.put('/:postId', postsController.update);
router.delete('/:postId', postsController.delete);
router.post('/:postId/vote/:vote', postsController.vote);


module.exports = router;
