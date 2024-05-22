import { Router } from 'express';
import { auth, authCartUser, authUser } from '../config/auth.js';
import viewsController from '../controllers/viewsControler.js';
//import { Products } from "../dao/memory/products.memory.js";

const viewRoutes = Router();

/**
 * Ruta para renderizar la vista de chat.
 * @name GET /chat
 * @function
 */
viewRoutes.get('/chat', auth, viewsController.renderChat);

/**
 * Ruta para renderizar la vista de productos.
 * @name GET /products
 * @function
 */
viewRoutes.get('/products', auth, viewsController.renderProducts);

/**
 * Ruta para renderizar la vista de carrito.
 * @name GET /cart/:cid
 * @function
 */
viewRoutes.get('/cart/:cid', authCartUser, viewsController.renderCart);

/**
 * Ruta para renderizar la vista de registro.
 * @name GET /register
 * @function
 */
viewRoutes.get('/register', viewsController.renderRegister);

/**
 * Ruta para renderizar la vista de inicio de sesión.
 * @name GET /login
 * @function
 */
viewRoutes.get('/login', viewsController.renderLogin);

/**
 * Ruta para renderizar la vista de perfil.
 * @name GET /
 * @function
 */
viewRoutes.get('/', auth, viewsController.renderProfile);

/**
 * Ruta para renderizar la vista de restablecimiento de contraseña.
 * @name GET /restore
 * @function
 */
viewRoutes.get('/restore', viewsController.renderRestore);

/**
 * Ruta para renderizar la vista de generacion del ticket.
 * @name GET /restore
 * @function
 */
viewRoutes.get('/ticket', viewsController.renderTicket);

export default viewRoutes;