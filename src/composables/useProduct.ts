import type { EditProduct, NewProduct } from "./types";
import { data } from "./useLS";

export const empty_product = {
    name: "",
    ingridients: "",
    description: "",
    price: 0,
    comments: []
}

export function addProduct(product: NewProduct) {
    data.products[data.new_product_id] = { id: data.new_product_id, ...product }
    data.new_product_id++
}

export function editProduct(product_edited: EditProduct) {
    const pass = data.products[product_edited.id] ?? false
    if (!pass) return false
    Object.assign(data.products[product_edited.id], product_edited)
    return true
}

export function deleteProduct(id: keyof typeof data.products) {
    delete data.products[id]
}