require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const { startSubscriptionCron } = require('./config/cron');

// ── Route Modules ────────────────────────────────────────────
const societiesRouter = require('./routes/societies');
const storefrontRouter = require('./routes/storefront');
const ordersRouter = require('./routes/orders');
const vendorAuthRouter = require('./routes/vendorAuth');
const vendorPanelRouter = require('./routes/vendorPanel');
const adminRouter = require('./routes/admin');

// ── App Setup ────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

// ── Database Init ────────────────────────────────────────────
initDb().catch(err => console.error('Database initialization error:', err));

// ── Mount Routes ─────────────────────────────────────────────
app.use('/api/societies', societiesRouter);   // Society management
app.use('/api', storefrontRouter);  // /api/societies/:id/vendors + /api/vendors/:id
app.use('/api/orders', ordersRouter);      // Customer orders
app.use('/api/vendors', vendorAuthRouter);  // Vendor register & login
app.use('/api/vendorPanel', vendorPanelRouter); // Vendor dashboard & renewal
app.use('/api/admin', adminRouter);       // Admin portal

// ── Legacy Backward-Compatibility Routes ─────────────────────
app.post('/registerVender', (req, res) => {
    req.url = '/api/vendors/register';
    app._router.handle(req, res);
});

app.get('/venderPanel/:venderId', (req, res) => {
    res.redirect(`/api/vendorPanel/${req.params.venderId}`);
});

// ── QR Code Shop Direct Link ─────────────────────────────────
// Scanned QR → GET /shop/:vendorId → redirect to frontend storefront URL
const { query } = require('./db');
app.get('/shop/:vendorId', async (req, res) => {
    try {
        const { vendorId } = req.params;
        const result = await query(
            `SELECT vendor_id, society_id, store_name FROM vendors WHERE vendor_id = ?`,
            [vendorId]
        );
        if (result.rows.length === 0) {
            return res.status(404).send('<h2>Shop not found</h2>');
        }
        const vendor = result.rows[0];
        // Redirect to frontend SPA route: /{societyId}/{vendorId}
        const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendOrigin}/${vendor.society_id}/${vendor.vendor_id}`);
    } catch (err) {
        console.error('QR shop redirect error:', err);
        res.status(500).send('<h2>Server error</h2>');
    }
});

// ── Start Cron Jobs ──────────────────────────────────────────
startSubscriptionCron();

// ── Start Server ─────────────────────────────────────────────
const server = app.listen(PORT, () => {
    console.log(`DigiLocal Server running on PORT ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\nPort ${PORT} is already in use. Stop existing server or change PORT in .env\n`);
    } else {
        console.error('Server error:', err);
    }
});