const express = require('express');
const { createClient } = require('soap');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Configuración de CORS
app.use(cors());
app.use(bodyParser.raw({ type: () => true }));

// Configuración de la base de datos MySQL
const db = mysql.createPool({
    host: 'mysql-christopherobin.alwaysdata.net',
    user: '358042_admin',
    password: 'YqUZn6T6AxLYc5k',
    database: 'christopherobin_practiceclientserver'
});

app.post('/soap', (req, res) => {
    const xml = req.body.toString();
    const usernameRegex = /<log:username>(.*?)<\/log:username>/;
    const passwordRegex = /<log:password>(.*?)<\/log:password>/;

    const usernameMatch = xml.match(usernameRegex);
    const passwordMatch = xml.match(passwordRegex);

    if (usernameMatch && passwordMatch) {
        const username = usernameMatch[1];
        const password = passwordMatch[1];

        db.query(
            'SELECT * FROM usuarios WHERE username = ? AND password = ?',
            [username, password],
            (err, results) => {
                if (err) {
                    res.status(500).send('Internal Server Error');
                    return;
                }
                if (results.length > 0) {
                    res.send(`
                        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
                            <soapenv:Body>
                                <loginResponse>Login Successfully</loginResponse>
                            </soapenv:Body>
                        </soapenv:Envelope>
                    `);
                } else {
                    res.send(`
                        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
                            <soapenv:Body>
                                <loginResponse>Invalid credentials</loginResponse>
                            </soapenv:Body>
                        </soapenv:Envelope>
                    `);
                }
            }
        );
    } else {
        res.status(400).send('Bad Request');
    }
});

app.listen(port, () => {
    console.log(`Servidor SOAP escuchando en http://localhost:${port}`);
});
