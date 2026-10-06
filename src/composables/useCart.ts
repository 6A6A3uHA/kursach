import type { Id } from "./types";
import { data } from "./useLS";
import { user } from "./useUser";

export function addToCart(id: Id) {
    if (data.carts[user.id].products[id] == undefined) return data.carts[user.id].products[id] = 1
    data.carts[user.id].products[id]++
}

export function minusToCart(id: Id) {
    data.carts[user.id].products[id]--
    if (data.carts[user.id].products[id] == 0) return delete data.carts[user.id].products[id]
}

export function deleteToCart(id: Id) {
    delete data.carts[user.id].products[id]
}