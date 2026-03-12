const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route – serve your welcome page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'WelcomePage', 'Welcome.html'));
});

// Example API endpoint (replace with your actual logic)
app.get('/api/products', (req, res) => {
  res.json({ categories: ['Eco‑Friendly Home', 'Organic Food', 'Sustainable Fashion'] });
});

// Export the app for Vercel (do NOT call app.listen)
module.exports = app;