const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const soap = require('soap');
const mysql = require('mysql');

const app = express();
app.use(bodyParser.raw({ type: () => true, limit: '5mb' }));
app.use(cors());

const db = mysql.createConnection({
    host: 'mysql-christopherobin.alwaysdata.net',
    user: '358042_admin',
    password: 'YqUZn6T6AxLYc5k',
    database: 'christopherobin_practiceclientserver'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

const service = {
    LoginService: {
        LoginServiceSoapPort: {
            login(args, callback) {
                const username = args.username;
                const password = args.password;

                const query = 'SELECT * FROM usuarios WHERE username = ? AND password = ?';
                db.query(query, [username, password], (err, results) => {
                    if (err) {
                        callback({
                            result: 'Error',
                            message: 'Database error'
                        });
                    } else if (results.length > 0) {
                        callback({
                            result: 'Success',
                            message: 'Login Successfully'
                        });
                    } else {
                        callback({
                            result: 'Error',
                            message: 'Invalid credentials'
                        });
                    }
                });
            }
        }
    }
};

const wsdl = `
<definitions name="LoginService" targetNamespace="http://example.com/login" xmlns:tns="http://example.com/login" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://schemas.xmlsoap.org/wsdl/">
    <types>
        <xsd:schema targetNamespace="http://example.com/login">
            <xsd:element name="login">
                <xsd:complexType>
                    <xsd:sequence>
                        <xsd:element name="username" type="xsd:string"/>
                        <xsd:element name="password" type="xsd:string"/>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:element>
            <xsd:element name="loginResponse">
                <xsd:complexType>
                    <xsd:sequence>
                        <xsd:element name="result" type="xsd:string"/>
                        <xsd:element name="message" type="xsd:string"/>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:element>
        </xsd:schema>
    </types>
    <message name="loginRequest">
        <part name="parameters" element="tns:login"/>
    </message>
    <message name="loginResponse">
        <part name="parameters" element="tns:loginResponse"/>
    </message>
    <portType name="LoginServiceSoapPort">
        <operation name="login">
            <input message="tns:loginRequest"/>
            <output message="tns:loginResponse"/>
        </operation>
    </portType>
    <binding name="LoginServiceSoapBinding" type="tns:LoginServiceSoapPort">
        <soap:binding transport="http://schemas.xmlsoap.org/soap/http" style="document"/>
        <operation name="login">
            <soap:operation soapAction="http://example.com/login/login"/>
            <input>
                <soap:body use="literal"/>
            </input>
            <output>
                <soap:body use="literal"/>
            </output>
        </operation>
    </binding>
    <service name="LoginService">
        <port name="LoginServiceSoapPort" binding="tns:LoginServiceSoapBinding">
            <soap:address location="http://localhost:3000/soap"/>
        </port>
    </service>
</definitions>
`;

app.listen(3000, () => {
    soap.listen(app, '/soap', service, wsdl);
    console.log('SOAP service is running on http://localhost:3000/soap');
});
