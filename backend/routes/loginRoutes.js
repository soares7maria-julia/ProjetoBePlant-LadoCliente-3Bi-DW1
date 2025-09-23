const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// Cadastro
router.post('/cadastrar', loginController.cadastrar);

// Login
router.post('/', loginController.login);

// Logout
router.post('/logout', loginController.logout);

module.exports = router;
