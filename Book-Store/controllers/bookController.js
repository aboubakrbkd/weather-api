const Book = require('../models/Book');
const redis = require('../models/Redis');

exports.getAllBooks = async (req, res) => {
    try{
        const cache = await redis.get('books');
        if (cache) {
            console.log('Serving from redis cache');
            return res.status(200).json(JSON.parse(cache));
        }
        const books = await Book.find();
        await redis.set('books', JSON.stringify(books), {EX: 60});
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get books' });
    }
}

exports.getBookId = async (req, res) => {
    const id = req.params.id;
    if (!id)
        return res.status(400).json({ error: 'Id required' });
    try {
        const cacheKey = `book:${id}`;
        const cachedBook = await redis.get(cacheKey);
        if (cachedBook) {
            console.log('Serving single book from Redis');
            return res.status(200).json(JSON.parse(cachedBook));
        }
        const book = await Book.findById(id);
        if (!book)
            return res.status(404).json({ error: 'Book not found' });
        await redis.set(cacheKey, JSON.stringify(book), { EX: 60 });
        res.status(200).json(book);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get book' });
    }
};

exports.newBook = async (req, res) => {
    try {
        const newBook = new Book(req.body);
        await newBook.save();
        await redis.del('books');
        res.status(201).json(newBook);
    } catch (err) {
        res.status(400).json({ error: 'Failed to create book' });
    }
}

exports.updateBook = async (req, res) => {
    try {
        const updated = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated)
            return res.status(404).json({ error: 'Book not found' });
        await redis.del('books');
        await redis.del(`book:${req.params.id}`);
        res.status(200).json(updated);
    } catch (err) {
        res.status(400).json({ error: 'Failed to update book' });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const deleted = await Book.findByIdAndDelete(req.params.id);
        if (!deleted)
            return res.status(404).json({ error: 'Book not found' });
        await redis.del('books');
        await redis.del(`book:${req.params.id}`);
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete book' });
    }
};