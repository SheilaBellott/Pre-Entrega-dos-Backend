import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Productos iniciales
let products = [
  { id: '1', name: 'Producto 1', price: '100' },
  { id: '2', name: 'Producto 2', price: '200' },
  { id: '3', name: 'Producto 2', price: '300' }
];

// Configuración de Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta para servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Ruta para la vista home.handlebars
app.get('/', (req, res) => {
  res.render('home', { products });
});

// Ruta para la vista realTimeProducts.handlebars
app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts', { products });
});

// Endpoint para agregar un producto
app.post('/products', (req, res) => {
  const product = req.body;
  products.push(product);
  io.emit('updateProducts', products);
  res.status(201).send();
});

// Endpoint para eliminar un producto (por id)
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  products = products.filter(product => product.id !== id);
  io.emit('updateProducts', products);
  res.status(200).send();
});

// Configuración de Socket.io
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.emit('updateProducts', products);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 8080; 
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


