const SerialPort = require('serialport');
const WebSocket = require('ws');

// Conectar al puerto COM del Arduino
const port = new SerialPort('COM5', { baudRate: 9600 }); // Cambia COM5 por tu puerto

// Crear un servidor WebSocket
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Cliente WebSocket conectado');

    // Leer datos desde el puerto serial
    port.on('data', (data) => {
        const rawData = data.toString();  // Convertir el dato a string
        console.log(`Datos recibidos desde Arduino: ${rawData}`);

        // Simular separación de datos analógicos y digitales (en un proyecto real, estarían separados)
        const analogData = rawData.split(',')[0];  // Asumimos que los datos llegan separados por comas
        const digitalData = rawData.split(',')[1]; // Segundo valor

        // Crear un objeto para los datos
        const sensorData = {
            analog: analogData.trim(),
            digital: digitalData.trim(),
        };

        // Enviar los datos como JSON al cliente WebSocket
        ws.send(JSON.stringify(sensorData));
    });

    ws.on('close', () => {
        console.log('Cliente WebSocket desconectado');
    });
});

console.log('Servidor WebSocket corriendo en ws://localhost:8080');
