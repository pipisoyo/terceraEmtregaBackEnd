/**
 * Importación de módulos y configuraciones necesarias.
 */
import express from "express";
import handlebars from 'express-handlebars'
import __dirname from "./utils.js";
import initilizePassport from "./config/passport.config.js";
import appMiddlewares from './config/appMiddlewares.js';
import { app } from './config/server.js';
import { productsRouter, cartsRoutes, sessionsRouter, viewesRoutes } from './routes/routes.js'
import initSocket from './socket.js';
import realTimeProducts from "./routes/realTimeProductsRoute.js";

// Middlewares
/**
 * Middlewares de la aplicación.
 */
app.use(appMiddlewares);

// Rutas
/**
 * Definición de las rutas de la aplicación.
 */
app.use("/api/realtimeproducts", realTimeProducts);
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRoutes);
app.use("/api/sessions", sessionsRouter);
app.use(viewesRoutes);
//app.use("/api/products/", localRouterProducts);
//app.use("/api/carts/", localCartsRoute);

// Handlebars
/**
 * Configuración de Handlebars para las vistas.
 */
app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars');

// Passport - autenticación
/**
 * Inicialización de Passport para autenticación.
 */
initilizePassport();

// Socket (realtime)
/**
 * Inicialización de Socket para comunicación en tiempo real.
 */
initSocket();