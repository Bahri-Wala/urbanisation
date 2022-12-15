var express = require('express');
var router = express.Router();
const devis_action =require('../methodes/devis_action')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/creation_devis',devis_action.build_devis);

module.exports = router;
