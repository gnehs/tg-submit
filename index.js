const app = require('./app');

app.listen(3000, () => {
    console.log('TIME', new Date().toLocaleTimeString())
    console.log('INFO', 'http://localhost:3000/')
});