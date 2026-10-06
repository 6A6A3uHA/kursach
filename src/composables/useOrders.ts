import type { EditedOrder, NewOrder, Order } from "./types";
import { data } from "./useLS";

export const empty_order: Order = {
    id: 0,
    user_id: -1,
    products: {},
    total_price: -1,
    created_at: 0,
    date: '0',
    pay_type: 'offline',
    status: 'closed',
    address: ''
}

function formatDate(date: Date = new Date()): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`
}

function get_order_new_id() {
    const id = data.new_order_id
    data.new_order_id++
    return id
}

export function addOrder(new_order: NewOrder) {
    const id = get_order_new_id()
    const order: Order = {
        id: id,
        created_at: Date.now(),
        date: formatDate(),
        status: 'created',
        pay_type: new_order.pay_type,
        products: new_order.products,
        total_price: new_order.total_price,
        user_id: new_order.user_id,
        address: new_order.address
    }
    data.orders[id] = order
}

export function editOrder(edited_order: EditedOrder) {
    Object.assign(data.orders[edited_order.id], edited_order)
}

export function deleteOrder(id: keyof typeof data.orders) {
    delete data.orders[id]
}