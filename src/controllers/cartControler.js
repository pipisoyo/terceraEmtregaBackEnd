//import CartsManager from "../dao/mongo/cartManager.js"
//import CartsManager from "../dao/memory/carts.memory.js";
import { io } from "socket.io-client";
import response from "../config/responses.js";
import ticketModel from "../dao/models/tickets.js";
import { cartsService } from "../repositories/index.js";
import { productsSercivce } from "../repositories/index.js";
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
        const quantity = 1;

        try {
            let cart = await cartsService.getCartById(cid);
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
    deleteProductToCart: async (req, res) => {
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
     * Clear the cart by removing all products.
     * @param {object} req - Request object.
     * @param {object} res - Response object.
     */
    clearCart: async (req, res) => {
        const cid = req.params.cid;
        const products = [];
        try {
            await cartsService.updateCart(cid, products);
            response.successResponse(res, "All products removed from the cart");
        } catch (error) {
            console.error("Error:", error);
            response.serverErrorResponse(res, "Error removing the products from the cart");
        }
    },

    /**
    /**
     * Finalizar el proceso de compra de un carrito.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    completePurchase: async (req, res) => {
        const cid = req.params.cid;


        try {
            // Obtener el carrito por su ID
            const cart = await cartsService.getCartById(cid);
            console.log("🚀 ~ completePurchase: ~ cart:", cart)
            
            

            // Verificar el stock de los productos en el carrito
            const productsToPurchase = [];  
            
            const productsNotPurchased = [];
            
            let i=1;

            for (const product of cart.products) {
                
                let productId= (cart.products[i-1].product._id).toString()
                const productData = await productsSercivce.getById(productId);
                console.log("🚀 ~ completePurchase: ~ productData:", productData)
                
                if (productData.stock >= cart.products[i-1].quantity) {
                    productData.stock = productData.stock - cart.products[i-1].quantity;
                    console.log("🚀 ~ completePurchase: ~ cart.products[i-1].quantity:", cart.products[i-1].quantity)
                    console.log("🚀 ~ completePurchase: ~ productData.stock:", productData.stock)
 
                    await cartsService.updateQuantity(cart._id.toString(),productId, 0);
                    await productsSercivce.updateProduct(productId,productData)
                    productsToPurchase.push(product);
                } else {
                    productsNotPurchased.push(product);
                }
                i++
            }
            // Generar un ticket con los datos de la compra
            const ticketData = {
                code: generateUniqueCode(cart._id, new Date()),
                purchase_datetime: new Date(),
                amount: calculateTotalAmount(productsToPurchase),
                purchaser: req.user.email
            };

            // Crear un nuevo ticket utilizando el modelo de Ticket de Mongoose
            const newTicket = new ticketModel(ticketData);
            console.log("🚀 ~ completePurchase: ~ newTicket:", newTicket)
            await newTicket.save();

            if (productsNotPurchased.length > 0) {
                for (const product of productsNotPurchased) {
                    await cartsService.updateQuantity(cart._id.toString(), product.product._id.toString(), product.quantity);
                }
                response.successResponse(res, 400, "Algunos productos no se pudieron procesar",  productsNotPurchased);
            } else {
                response.successResponse(res, 200, "Compra realizada exitosamente", newTicket);
            }
        } catch (error) {
            
            console.error("Error al finalizar la compra:", error);
            response.errorResponse(res, 500, "Error al finalizar la compra");
        }
    },
};

export default cartControler;