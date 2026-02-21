var express = require('express');
var router = express.Router();
const AccountController = require('../controller/accountsystem.controller');

/* GET home page. */
router.get('/v1/account/accountall',AccountController.accountProfileAll);
router.get('/v1/account/accounByDedicate/:emcode',AccountController.accounByDedicate);
router.get('/v1/account/accountById/:Id',AccountController.accountById);

router.post('/v1/account/login',AccountController.loginAccount);
router.post('/v1/account/addaccount',AccountController.createAccount);

router.put('/v1/account/updateaccount/:id',AccountController.accountUpdateById)
router.put('/v1/account/changepassword/:id',AccountController.changePassword)

router.delete('/v1/account/deleteById/:Id',AccountController.deleteById)


module.exports = router;
