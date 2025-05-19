const express = require('express');
const router = express.Router();
const authcontroller = require('../controllers/authController');


router.post('/login', authcontroller.login);
router.post('/signup', authcontroller.signup);
router.post('/refresh', authcontroller.refresh);
router.post('/logout', authcontroller.logout);
router.get('/verify-link', authcontroller.verifyEmail);
router.post('/forgot-password', authcontroller.forgotPassword);
router.post('/reset-password', authcontroller.resetPassword);


module.exports = router;