import type { Id } from "./types";
import { data } from "./useLS";
import { user } from "./useUser";

export function addToFavorites(id: Id) {
    if (data.carts[user.id].products[id] == undefined) return data.carts[user.id].products[id] = 1
    data.carts[user.id].products[id]++
}

export function deleteToFavorites(id: Id) {
    delete data.carts[user.id].products[id]
}