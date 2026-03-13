const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Render sets the PORT environment variable

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route – serve your welcome page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'WelcomePage', 'welcome.html'));
});

// Example API endpoint
app.get('/api/products', (req, res) => {
  res.json({ categories: ['Eco‑Friendly Home', 'Organic Food', 'Sustainable Fashion'] });
});

// Start the server (this is what Render needs)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});