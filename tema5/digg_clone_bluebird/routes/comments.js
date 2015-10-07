var express = require('express');
var auth = require('../simpleauth');

var Comment = require('../models/comment');
var Post = require('../models/post');

var commentsController = {
  // GET /?post_id=xxxxxx
  index: function(req, res) {
    // TODO: traer comentarios para un Post concreto
    res.send([]);
  },
  // Guarda un nuevo comentario en la colección
  // y debería sumar un comentario al Post en cuestión
  create: function(req, res) {
    console.log('Create comment', req.body);
    // TODO: cargar el post primero para ver si existe
    // y si es así, creamos el comentario y actualizamos el Post
  },
  // Suma 1 al número de votos de un comentario
  vote: function(req, res) {
    // TODO: actualizar votos y guardar comentario
  },
  // Lee de BBDD un comentario a partir de su id
  // y lo almacena en req.comment para el resto de middlewares
  param: function(req, res, next, commentsId) {
    // TODO: cargar un comentario a partir de su id
    // si no existe, devolver un 404 not found - res.status(404).end()
  }
};

var router = express.Router();
router.use(auth.requiresToken);
router.get('/', commentsController.index);
router.post('/', commentsController.create);
router.post('/:commentsid/vote/:vote', commentsController.vote);
router.param('commentsid', commentsController.param);

module.exports = router;
