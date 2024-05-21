import CartDTO from "../dao/DTOs/carts.dto.js";

export default class CartRepository {

    constructor(dao) {
        this.dao = dao;
    }

    getAll = async () => {
        let result = await this.dao.getAll();
        return result;
    }

    getCartById = async (id) => {
        let result = await this.dao.getCartById(id);
        return result;
    }

    createCart = async () => {
        let result = await this.dao.createCart();
        return result;
    }

    addProductToCart = async (cartId, productId, quantity) => {
        let result = await this.dao.addProduct(cartId, productId, quantity);
        return result;
    }

    deleteProduct = async (cartId, productId) => {
        let result = await this.dao.deleteProduct(cartId, productId);
        return result;
    }

    updateCart = async (cartId, newCart) => {
        const cart = new CartDTO(newCart);
        let result = await this.dao.updateCart(cartId, cart);
        return result;
    }

    updateQuantity = async (cartId, productId, newQuantity) => {
        let result = await this.dao.updateQuantity(cartId, productId, newQuantity);
        return result;
    }

    clearCart = async (cartId) => {
        let result = await this.dao.clearCart(cartId);
        return result;
    }
}