const express = require('express');

const app = express();

const PORT = process.env.PORT || 8080;

app.get('/api/health', (req, res) => {
    res.send('OK');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});