import { Products} from "../dao/factory.js";
import { Carts } from "../dao/factory.js";
import ProductRepository from "./products.repository.js";
import CartRepository from "./carts.repository.js";

export const productsSercivce = new ProductRepository(new Products())
export const cartsService = new CartRepository(new Carts())

