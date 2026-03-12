/**
 * EcoWise Market — Node.js Express Server
 * Run: node server.js
 * Visit: http://localhost:3000
 */

const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Serve the welcome page assets as static files ─────────────────────────
// NOTE: the HTML, CSS and JS are located inside `public/WelcomePage`.
app.use(express.static(path.join(__dirname, 'public', 'WelcomePage')));

// ── Root route (serves the welcome page) ───────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'WelcomePage', 'welcome.html'));
});

// ── Simple API stub: product categories (JSON) ────────────────────────────────
app.get('/api/categories', (req, res) => {
  res.json([
    { id: 1, name: 'Eco-Friendly Home',  emoji: '🏡', count: 142, desc: 'Bamboo, reusable, compostable' },
    { id: 2, name: 'Organic Foods',      emoji: '☕', count: 89,  desc: 'Fair-trade coffee, spices & snacks' },
    { id: 3, name: 'Sustainable Fashion',emoji: '👗', count: 213, desc: 'Recycled fibres, vegan leather' },
    { id: 4, name: 'Zero-Waste Care',    emoji: '🧴', count: 76,  desc: 'Shampoo bars, bamboo brushes' },
    { id: 5, name: 'Green Tech',         emoji: '⚡', count: 54,  desc: 'Solar chargers, energy-efficient' },
  ]);
});

// ── Simple API stub: platform impact stats ────────────────────────────────────
app.get('/api/stats', (req, res) => {
  res.json({
    treesPlanted : 847200,
    plasticSaved : 124600,
    co2Offset    : 9850,
  });
});

// ── 404 fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send('<h2>404 — Page not found</h2><p><a href="/">Return to EcoWise Market</a></p>');
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌿 EcoWise Market server running at http://localhost:${PORT}\n`);
});