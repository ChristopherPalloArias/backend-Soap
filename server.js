const express = require('express');
const { createClient } = require('soap');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

const app = express(); // Crea una instancia de Express
const port = 3000; // Define el puerto en el que el servidor va a escuchar

// Configuración de CORS
app.use(cors()); // Habilita CORS en el servidor
app.use(bodyParser.raw({ type: () => true })); // Configura body-parser para manejar cuerpos de solicitudes en bruto

// Configuración de la base de datos MySQL
const db = mysql.createPool({
    host: 'mysql-christopherobin.alwaysdata.net',
    user: '358042_admin',
    password: 'YqUZn6T6AxLYc5k',
    database: 'christopherobin_practiceclientserver'
});

// Endpoint para verificar que el servidor está corriendo
app.get('/', (req, res) => {
    res.send('El servidor SOAP está corriendo');
});

// Endpoint para manejar solicitudes SOAP
app.post('/soap', (req, res) => {
    const xml = req.body.toString(); // Convierte el cuerpo de la solicitud a una cadena
    const usernameRegex = /<log:username>(.*?)<\/log:username>/; // Expresión regular para extraer el nombre de usuario
    const passwordRegex = /<log:password>(.*?)<\/log:password>/; // Expresión regular para extraer la contraseña

    //buscan y extraen el name y password del cuerpo XML de la solicitud SOAP utilizando expresiones regulares
    const usernameMatch = xml.match(usernameRegex);
    const passwordMatch = xml.match(passwordRegex);

    // Verifica si se encontraron el nombre de usuario y la contraseña en el XML
    if (usernameMatch && passwordMatch) {
        const username = usernameMatch[1];
        const password = passwordMatch[1];

        // Consulta la base de datos para verificar las credenciales
        db.query(
            'SELECT * FROM usuarios WHERE username = ? AND password = ?',
            [username, password],
            (err, results) => {
                if (err) {
                    res.status(500).send('Internal Server Error');
                    return;
                }
                // Envía una respuesta SOAP basada en el resultado de la consulta
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
        res.status(400).send('Bad Request'); // Responde con un error 400 si no se encontraron credenciales
    }
});

// Inicia el servidor y escucha en el puerto especificado
app.listen(port, () => {
    console.log(`Servidor SOAP escuchando en http://localhost:${port}`);
});