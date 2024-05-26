import { io } from "socket.io-client";
import response from "../config/responses.js";
import ticketModel from "../dao/models/tickets.js";
import { cartsService } from "../repositories/index.js";
import { productsService } from "../repositories/index.js";
import { calculateTotalAmount, generateUniqueCode } from "../utils.js";

/**
 * Controlador para la gestión de carritos.
 */
const cartControler = {

    /**
     * Recupera un carrito por su ID.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    getCartById: async (req, res) => {
        const cid = req.params.cid;

        try {
            const cart = await cartsService.getCartById(cid);
            if (cart.error) {
                response.errorResponse(res, 404, "El carrito no existe");
            } else {
                response.successResponse(res, 200, "Carrito recuperado exitosamente", cart);
            }
        } catch (error) {
            console.error('Error:', error);
            response.errorResponse(res, 500, "Error al recuperar el Carrito");
        }
    },

    /**
     * Crea un nuevo carrito.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    createCart: async (req, res) => {
        try {
            const newCart = await cartsService.createCart();
            response.successResponse(res, 201, "Carrito creado exitosamente", newCart);
        } catch (error) {
            console.error("Error al crear el carrito:", error);
            response.errorResponse(res, 500, "Error al crear el Carrito");
        }
    },

    /**
     * Agrega un producto al carrito.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    addProductToCart: async (req, res) => {
        const pid = req.params.pid;
        const cid = req.params.cid;
        console.log("🚀 ~ addProductToCart: ~ cid:", cid)
        const quantity = 1;

        try {
            let cart = await cartsService.getCartById(cid);
            console.log("🚀 ~ addProductToCart: ~ cart:", cart)
            if (!cart || cart.length === 0) {
                cart = await cartsService.createCart();
            }
            await cartsService.addProductToCart(cid, pid, quantity);
            response.successResponse(res, 201, "Producto agregado al carrito");
        } catch (error) {
            console.error("Error al intentar agregar el producto al carrito", error);
            response.errorResponse(res, 500, "Error al intentar agregar el producto al Carrito");
        }
    },

    /**
     * Elimina un producto del carrito.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    deleteProduct: async (req, res) => {
        const cid = req.params.cid;
        const pid = req.params.pid;

        try {
            await cartsService.deleteProduct(cid, pid);
            response.successResponse(res, 200, "Producto eliminado del carrito");
        } catch (error) {
            console.error("Error al intentar eliminar el producto del carrito", error);
            response.errorResponse(res, 500, "Error al intentar eliminar el producto del carrito");
        }
    },

    /**
     * Actualiza el contenido del carrito.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    updateCart: async (req, res) => {
        const cid = req.params.cid;
        const products = req.body.products;

        try {
            await cartsService.updateCart(cid, products);
            response.successResponse(res, 200, "Carrito actualizado");
        } catch (error) {
            console.error("Error al intentar actualizar el carrito", error);
            response.errorResponse(res, 500, "Error al intentar actualizar el carrito");
        }
    },

    /**
     * Actualiza la cantidad de un producto en el carrito.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    updateQuantity: async (req, res) => {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const quantity = req.body.quantity;

        try {
            await cartsService.updateQuantity(cid, pid, quantity);
            response.successResponse(res, 200, "Cantidad de producto actualizada");
        } catch (error) {
            console.error("Error al intentar actualizar la cantidad del producto", error);
            response.errorResponse(res, 500, "Error al intentar actualizar la cantidad del producto");
        }
    },

    /**
     * Limpia el carrito eliminando todos los productos.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    clearCart: async (req, res) => {
        const cid = req.params.cid;
        const products = [];
        try {
            await cartsService.updateCart(cid, products);
            response.successResponse(res, "Todos los productos eliminados del carrito");
        } catch (error) {
            console.error("Error:", error);
            response.errorResponse(res, "Error al eliminar los productos del carrito");
        }
    },

    /**
 * Finaliza el proceso de compra de un carrito.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 */
    completePurchase: async (req, res) => {
        const cid = req.params.cid;
        console.log("🚀 ~ completePurchase: ~ cid:", cid)
    
        try {
            // Obtener el carrito por su ID
            const cart = await cartsService.getCartById(cid);
    
            // Verificar el stock de los productos en el carrito
            const productsToPurchase = [];
            const productsNotPurchased = [];
    
            for (let index = 0; index < cart.products.length; index++) {
                const productId = cart.products[index].product._id.toString();
                const productData = await productsService.getById(productId);
    
                // Verificar y actualizar el stock del producto
                if (productData.stock >= cart.products[index].quantity) {
                    productData.stock -= cart.products[index].quantity;
                    await cartsService.deleteProduct(cart._id.toString(), productId);
                    await productsService.updateProduct(productId, productData);
                    productsToPurchase.push(cart.products[index]);
                } else {
                    productsNotPurchased.push({product:cart.products[index].product, quantity:cart.products[index].quantity});
                }
            }
            let purchaser = req.user.email;
            if (!purchaser) {
                purchaser = req.user.first_name;
            }
    
            // Verificar si hay productos para comprar antes de generar un ticket
            if (productsToPurchase.length > 0) {
                // Generar un ticket con los datos de la compra
                const ticketData = {
                    code: generateUniqueCode(cart._id, new Date()),
                    purchase_datetime: new Date(),
                    amount: calculateTotalAmount(productsToPurchase),
                    purchaser: purchaser,
                    productsToPurchase
                };
    
                // Crear un nuevo ticket utilizando el modelo de Ticket de Mongoose
                const newTicket = new ticketModel(ticketData);
                await newTicket.save();
    
                // Manejo de productos no comprados
                if (productsNotPurchased.length > 0) {
                    const id = cart._id.toString();
                    await cartsService.updateCart(id, productsNotPurchased);
                    response.successResponse(res, 207, "Algunos productos no se pudieron procesar", {productsNotPurchased, newTicket});
                } else {
                    response.successResponse(res, 200, "Compra realizada exitosamente", newTicket);
                }
            } else {
                response.errorResponse(res, 409, "No se generó un ticket ya que no hay productos para comprar",);
            }
            
        } catch (error) {
            console.error("Error al finalizar la compra:", error);
            response.errorResponse(res, 500, "Error al finalizar la compra");
        }
    },
    
};

/**
 * Exporta los enrutadores de las rutas Carts.
 * @controlers
 */
export default cartControler;