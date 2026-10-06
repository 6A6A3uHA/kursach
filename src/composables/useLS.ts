import { reactive, watch } from "vue";
import type { Data } from "./types";
import { addProduct } from "./useProduct";
import { createUser } from "./useUser";


export const data = reactive<Data>({
    users: {},
    products: {},
    favorites: {},
    carts: {},
    passwords: {},
    active_session: -1,
    new_user_id: 1,
    new_product_id: 0,
    orders: {},
    new_order_id: 0
})

data.users[0] = {
    id: 0,
    login: "admin123",
    firstname: "admin",
    lastname: "admin",
    email: "",
    phone: "",
    address: "",
    root: 1
}
data.passwords[0] = "admin123"

for (let index = 1; index < 100; index++) {
    createUser({
        login: `login${index}${index}${index}`,
        firstname: `${index}${index}`,
        lastname: `${index}${index}`,
        email: "",
        phone: "",
        address: ""
    }, String(index * 11111111))
}
for (let index = 1; index < 100; index++) {
    addProduct({
        name: `Блюдо ${index}`,
        description: String(index).repeat(250),
        ingridients: String(index).repeat(100),
        price: index * 10,
        comments: []
    })
}


export function saveData(): void {
    const hasUsers = Object.keys(data.users).length > 0
    const hasProducts = Object.keys(data.products).length > 0
    if (!hasUsers && !hasProducts && data.new_user_id === 0 && data.new_product_id === 0) return console.error('Нет данных')
    localStorage.setItem("data", JSON.stringify(data))
}

export function getData() {
    const ls = localStorage.getItem("data")
    if (!ls) return localStorage.setItem("data", JSON.stringify(data))
    const parse_ls: Data = JSON.parse(ls)
    Object.assign(data, parse_ls)
}

watch(data, () => {
    saveData()
}, { deep: true })

export function setActiveUser(id: number) {
    if (data.users[id]) {
        data.active_session = id
        return true
    }
    return false
}