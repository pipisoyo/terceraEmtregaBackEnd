import { io } from '../config/server.js';
import responses from "../config/responses.js";
import { productsSercivce } from "../repositories/index.js";

/**
 * Controlador para la gestión de productos.
 */
const productController = {
    
    /**
     * Recupera todos los productos con opciones de filtrado y paginación.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    getAll: async (req, res) => {
        try {
            const result = await productsSercivce.getAll()
            
            res.status(200).send({ status: "success", payload: result });
            return result
        } catch (error) {
            res.status(500).send({ status: "error", message: "Error al recuperar los productos" });
        }
    },

    
    /**
     * Recupera un producto por su ID.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    getById: async (req, res) => {
        try {
            const id = req.params._id;
            const result = await productsSercivce.getById(id);
            if (!result) {
                res.status(404).send({ status: "error", message: "Producto no encontrado" });
                return;
            }

            res.status(200).send({ status: "success", payload: result });
        } catch (error) {
            res.status(500).send({ status: "error", message: "Error al recuperar el producto" });
        }
    },
    
    /**
     * Agrega un nuevo producto.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    addProduct: async (req, res) => {
        
        try {
            const { title, description, price, code, stock, status, category, thumbnails } = req.body;

            // Validar los datos recibidos
            if (!title || !price || !code || !stock || !status || !category || !thumbnails) {
                res.status(400).send({ status: "error", message: "Faltan campos obligatorios" });
                return;
            }

            const result = await productsSercivce.addProduct({ title, description, price, code, stock, status, category, thumbnails });

            if (!result) {
                res.status(500).send({ status: "error", message: "Error al agregar el producto" });
                return;
            }

            res.status(201).send({ status: "success", payload: result });
        } catch (error) {
            res.status(500).send({ status: "error", message: "Error interno del servidor" });
        }
    },

    
    /**
     * Inserta un nuevo documento de producto.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    insertDocument: async (req, res) => {
        try {
            const product = req.body;
            let result = await productsSercivce.insertDocument(product);
            res.json({ result });
            let data = await productsSercivce.getAll();
            responses.successResponse(res, 201, "Documentos insertados exitosamente", result);
            io.emit('products', data.result);
        } catch (error) {
            console.error("Error al insertar el documento:", error);
            responses.errorResponse(res, 500, "Error al instertar el documento");
        }
    },
    
    /**
     * Actualiza un producto de forma sincrónica.
     * @param {Object} req - Objeto de solicitud HTTP.
     * @param {Object} res - Objeto de respuesta HTTP.
     */
    updateProduct: async (req, res) => {
        try {
            const id = req.params._id;
            const productData = req.body;
            const result = await productsSercivce.updateProduct(id, productData);
            let data = await productsSercivce.getAll();
            if (result) { 
                io.emit('products', data.result);
                res.status(201).send({ status: "success", payload: result });
              
            } else {
                res.status(404).send({ error: "Product not found" });
            }
        } catch (error) {
            res.status(500).send({ error: "An error occurred while updating the product" });
        }
    },
    
    /**
     * Elimina un producto de forma sincrónica.
     * @param {Object} req - Objeto de solicitud HTTP.
     * @param {Object} res - Objeto de respuesta HTTP.
     */
    deleteProduct: async (req, res) => {
        try {
            const id = req.params._id;
            const result = await productsSercivce.deleteProduct(id);
            const data = await productsSercivce.getAll();
            if (result) {
                res.status(201).send({ status: "success", payload: result });
                io.emit('products', data.result);
            } else {
                res.status(404).send({ error: "Product not found" });
            }
        } catch (error) {
            res.status(500).send({ error: "An error occurred while deleting the product" });
        }
    },

    realTime : async (req, res) => {
        try {
            const products = await productsSercivce.getAll();
            res.render('realTimeProducts', { products: products.result });
        } catch (error) {
            console.error('Error al obtener la lista de productos:', error);
            res.status(500).send('Error al obtener la lista de productos');
        }
    }
};

export default productController;