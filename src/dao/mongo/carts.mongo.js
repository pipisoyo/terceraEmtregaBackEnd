import cartsModel from "../models/carts.js";

class CartsManager {
    async getCartById(id) {

        
        try {
            return await cartsModel.findById(id).populate('products.product').lean().exec();
        } catch (error) {
            console.error("Error al obtener el carrito por ID:", error);
            throw new Error("Error al obtener el carrito por ID");
        }
    }

    async createCart() {
        try {
            return await cartsModel.create({});
        } catch (error) {
            console.error("Error al crear un nuevo carrito:", error);
            throw new Error("Error al crear un nuevo carrito");
        }
    }

    async addProduct(cid, pid, quantity) {
        try {
            let cart = await cartsModel.findById(cid);
            let product = cart.products.find((product) => product.product.toString() === pid);
            if (product) {
                product.quantity += quantity;
            } else {
                cart.products.push({ product: pid, quantity });
            }
            return await cart.save();
        } catch (error) {
            console.error("Error al agregar un producto al carrito:", error);
            throw new Error("Error al agregar un producto al carrito");
        }
    }

    async deleteProduct(cid, pid) {
        try {
            let cart = await cartsModel.findById(cid);
            let productIndex = cart.products.findIndex((product) => product.product.toString() === pid);
            if (productIndex === -1) {
                throw new Error("Producto no encontrado en el carrito");
            } else {
                cart.products.splice(productIndex, 1);
                return await cart.save();
            }
        } catch (error) {
            console.error("Error al eliminar un producto del carrito:", error);
            throw new Error("Error al eliminar un producto del carrito");
        }
    }

    async updateCart(cid, newCart) {
        try {
            let cart = await cartsModel.findById(cid);
            console.log("🚀 ~ CartsManager ~ updateCart ~ cart:", cart)
            cart.products = newCart;
            return await cart.save();
        } catch (error) {
            console.error("Error al actualizar el contenido del carrito:", error);
            throw new Error("Error al actualizar el contenido del carrito");
        }
    }

    async updateQuantity(cid, pid, newQuantity) {

        try {
            let cart = await cartsModel.findById(cid);
            let product = cart.products.find((product) => {
                
                return product.product.toString() === pid
            })
            if (product) {
                product.quantity = newQuantity;
                return await cart.save();
            } else {
                throw new Error("Producto no encontrado en el carrito");
            }
        } catch (error) {
            console.error("Error al actualizar la cantidad de un producto en el carrito:", error);
            throw new Error("Error al actualizar la cantidad de un producto en el carrito");
        }
    }
}

export default CartsManager;