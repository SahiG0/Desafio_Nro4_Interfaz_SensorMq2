// Obtener referencia a los botones y al contexto del canvas para el gráfico
const connectButton = document.getElementById('connect');
const disconnectButton = document.getElementById('disconnect');
const ctx = document.getElementById('dataChart').getContext('2d');

let gattServer; // Variable para almacenar la conexión GATT
let characteristic; // Variable para almacenar la característica

// Crear un nuevo gráfico utilizando Chart.js
let chart = new Chart(ctx, {
    type: 'line', // Tipo de gráfico
    data: {
        labels: [], // Etiquetas para el eje X (tiempo)
        datasets: [{
            label: 'Datos del Dispositivo', // Etiqueta del conjunto de datos
            data: [], // Datos a graficar
            borderColor: 'rgba(75, 192, 192, 1)', // Color de la línea
            borderWidth: 1, // Grosor de la línea
            fill: false // No llenar el área bajo la línea
        }]
    },
    options: {
        scales: {
            x: {
                type: 'linear', // Eje X como lineal
                position: 'bottom' // Posición del eje X
            }
        }
    }
});

// Evento que se activa al hacer clic en el botón de conexión
connectButton.addEventListener('click', async () => {
    try {
        // Solicitar al usuario seleccionar un dispositivo Bluetooth con el servicio especificado
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['battery_service'] }] // Cambia esto al servicio necesario
        });

        // Conectar al servidor GATT del dispositivo seleccionado
        gattServer = await device.gatt.connect();
        console.log('Conectado al dispositivo:', device.name);

        // Obtener el servicio y la característica deseada
        const service = await gattServer.getPrimaryService('battery_service'); // Cambia esto al servicio necesario
        characteristic = await service.getCharacteristic('battery_level'); // Cambia esto a la característica necesaria

        // Iniciar las notificaciones para recibir datos en tiempo real
        await characteristic.startNotifications();
        
        characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        
        disconnectButton.disabled = false; // Habilitar el botón de desconexión
        
    } catch (error) {
        // Manejo de errores durante la conexión o lectura
        console.error('Error al conectar:', error);
    }
});

// Evento que se activa al hacer clic en el botón de desconexión
disconnectButton.addEventListener('click', async () => {
    if (gattServer) {
        try {
            await gattServer.disconnect(); // Desconectar del servidor GATT
            console.log('Desconectado del dispositivo');
            disconnectButton.disabled = true; // Deshabilitar el botón de desconexión
            gattServer = null; // Limpiar la variable de conexión
            characteristic = null; // Limpiar la variable de característica
            
            chart.data.labels = []; // Limpiar los datos del gráfico
            chart.data.datasets[0].data = [];
            chart.update(); // Actualizar el gráfico para reflejar los cambios
            
        } catch (error) {
            console.error('Error al desconectar:', error);
        }
    }
});

// Función que se llama cuando se recibe una notificación de cambio en la característica
function handleCharacteristicValueChanged(event) {
    const value = event.target.value.getUint8(0); // Leer el valor como un número entero sin signo de 8 bits
    updateChart(value); // Actualizar el gráfico con el nuevo valor
}

// Función para actualizar el gráfico con nuevos datos
function updateChart(dataPoint) {
    const currentTime = new Date().toLocaleTimeString(); // Obtener la hora actual

    // Actualizar los datos del gráfico
    chart.data.labels.push(currentTime); // Agregar la hora actual a las etiquetas del eje X
    chart.data.datasets[0].data.push(dataPoint); // Agregar el nuevo dato al conjunto de datos

    // Limitar el número de puntos mostrados en el gráfico a 20
    if (chart.data.labels.length > 20) {
        chart.data.labels.shift(); // Eliminar la etiqueta más antigua
        chart.data.datasets[0].data.shift(); // Eliminar el dato más antiguo
    }

    chart.update(); // Actualizar el gráfico para reflejar los nuevos datos
}