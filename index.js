import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static HTML serving
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'public')));

let fnlbInstance;

app.post('/start', async (req, res) => {
    try {
        const { apiToken, categories } = req.body;
        if (!apiToken || !categories) {
            return res.status(400).send('Missing API token or categories');
        }

        const FNLB = await import('fnlb');
        fnlbInstance = new FNLB.default();

        await fnlbInstance.start({
            apiToken,
            numberOfShards: 1,
            botsPerShard: 1,
            categories: categories.split(',').map(c => c.trim()),
            logLevel: 'INFO'
        });

        res.send(`<h2>✅ FNLB started successfully!</h2>`);
    } catch (err) {
        console.error(err);
        res.status(500).send(`<h2>❌ Failed to start FNLB</h2><pre>${err.message}</pre>`);
    }
});

app.post('/restart', async (req, res) => {
    try {
        if (!fnlbInstance) return res.send('FNLB not started yet.');

        await fnlbInstance.stop();
        await fnlbInstance.start();

        res.send(`<h2>🔁 FNLB restarted successfully!</h2>`);
    } catch (err) {
        console.error(err);
        res.status(500).send(`<h2>❌ Failed to restart FNLB</h2><pre>${err.message}</pre>`);
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log('✅ FNLB API running');
});
