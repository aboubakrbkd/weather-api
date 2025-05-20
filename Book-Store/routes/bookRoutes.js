const express = require('express');
const router = express.Router();
const bookcontroller = require('../controllers/bookController');
const verify = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

router.get('/books', verify, bookcontroller.getAllBooks);
router.get('/books/:id', verify, bookcontroller.getBookId);
router.post('/books', verify, isAdmin, bookcontroller.newBook);
router.put('/books/:id', verify, isAdmin, bookcontroller.updateBook);
router.delete('/books/:id', verify, isAdmin, bookcontroller.deleteBook);

module.exports = router;