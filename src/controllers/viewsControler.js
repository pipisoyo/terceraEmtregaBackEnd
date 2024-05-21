import productsModel from '../dao/models/products.js';
import cartsModel from '../dao/models/carts.js';
import userModel from '../dao/models/users.js';
import response from '../config/responses.js';
//import ProductsManager from '../dao/mongo/productManager.js';
//import Products from "../dao/memory/products.memory.js"
//const productsServices = new ProductsManager()
import { Products } from '../dao/factory.js';


const productsServices = new Products();

/**
 * Controlador para la gestión de las vistas y renderizado de páginas.
 */
const viewsController = {

    /**
     * Renderiza la vista del chat.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    renderChat: (req, res) => {
        res.render('chat');
    },

    /**
     * Renderiza la vista de productos con paginación.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    renderProducts: async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        try {
            const products = await productsServices.getAll()
            const carts = await cartsModel.find({}).lean().exec();
            const users = await userModel.find({}).lean().exec();
            const totalCount = products.totalCount;
            const totalPages = Math.ceil(totalCount / limit);
            console.log("🚀 ~ renderProducts: ~ totalPages:", totalPages)
            const user = req.session.user;
            const role = req.session.user.role;
            const cartId = req.session.user.cartId;

            const results = await productsServices.getAll(limit,page)
            //console.log("🚀 ~ renderProducts: ~ results:", results)

            
            const prevLink = page > 1 ? `?limit=${limit}&page=${page - 1}` : null;
            const nextLink = page < totalPages ? `?limit=${limit}&page=${page + 1}` : null;

            const result = role === "admin";
            
            res.render('products', {
                users,
                user,
                carts,
                products: results.result,
                prevLink,
                nextLink,
                result,
                cartId
            });
        } catch (error) {
            response.errorResponse(res, 500, "Error al obtener los productos");
        }
    },

    /**
     * Renderiza la vista del carrito de compras.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    renderCart: async (req, res) => {
        const cid = req.params.cid;

        try {
            const cart = await cartsModel.findById(cid).populate('products.product').lean().exec();
            const products = cart.products.map(element => ({
                ...element.product,
                quantity: element.quantity
            }));
            const user = req.session.user;

            res.render('cart', { cart, cid, products, user });
        } catch (error) {
            console.error('Error:', error);
            response.errorResponse(res, 500, "Error en la base de datos");
        }
    },

    /**
     * Renderiza la vista de registro de usuario.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    renderRegister: (req, res) => {
        res.render('register');
    },

    /**
     * Renderiza la vista de inicio de sesión.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    renderLogin: (req, res) => {
        res.render('login');
    },

    /**
     * Renderiza la vista del perfil de usuario.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    renderProfile: (req, res) => {
        res.render('profile', { user: req.session.user });
    },

    /**
     * Renderiza la vista para restaurar contraseña.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    renderRestore: (req, res) => {
        res.render('restore');
    }
};

export default viewsController;