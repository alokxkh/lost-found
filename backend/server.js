const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Item = require('./models/Item');
const auth = require('./middleware/auth');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

// --- AUTH APIs ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Duplicate email registration' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid login credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid login credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ITEM APIs ---
// Add Item
app.post('/api/items', auth, async (req, res) => {
  try {
    const newItem = new Item({ ...req.body, userId: req.user.id });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// View all items
app.get('/api/items', auth, async (req, res) => {
  try {
    const items = await Item.find().sort({ date: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Search Items
app.get('/api/items/search', auth, async (req, res) => {
  try {
    const { name } = req.query;
    const items = await Item.find({ itemName: { $regex: name, $options: 'i' } });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// View item by ID
app.get('/api/items/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update item (Only owner)
app.put('/api/items/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete item (Only owner)
app.delete('/api/items/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));