const router = require('express').Router() ;
let authCntrl = require('../controllers/auth.controller') ;

router.route("/auth/facebook").get(authCntrl) ; 

module.exports = router ;