/**
 * Id чего то
 */
export type Id = number

/**
 * Содержимое создаваемого пользователя
 */
export interface NewUser {
    login: string,
    firstname: string,
    lastname: string,
    email: string,
    phone: string,
    address: string
}

/**
 * Содержимое существующего пользователя
 */
export interface User {
    id: keyof Users,
    login: string,
    firstname: string,
    lastname: string,
    email: string,
    phone: string,
    address: string,
    root: number
}

/**
 * Список пользователей
 */
export type Users = Record<Id, User>

/**
 * Содержимое комментария
 */
interface comment {
    id: Id,
    text: string,
    user_id: Id,
    created_at: number,
    time: string
}

/**
 * Содержимое нового продукта
 */
export interface NewProduct {
    name: string,
    description: string,
    ingridients: string,
    price: number
    comments: Array<comment>
}

/**
 * Содержимое продукта
 */
export interface Product {
    id: keyof Products,
    name: string,
    description: string,
    ingridients: string,
    price: number,
    comments: Array<comment>
}

/**
 * Необязательные поля для редактирования продукта
 */
export type EditProduct = Required<Pick<Product, 'id'>> & Partial<Omit<Product, 'id'>>

/**
 * Содержимое списка товаров
 */
export type Products = Record<Id, Product>

/**
 * Содержимое избранного
 */
export type Favorite = Record<Id, Product['id']>

/**
 * Содержимое списка избранного
 */
export type Favorites = Record<User['id'], Array<Product['id']>>

/**
 * Содержимое корзины
 */
export interface Cart {
    id: User['id'],
    products: Record<Product['id'], number>
}

/**
 * Содержимое списка корзин
 */
export type Carts = Record<User['id'], Cart>

/**
 * Пароль
 */
export type Password = string & {}

export interface ChangePassword {
    old_password: Password
    new_password: Password
    repeat_new_password: Password
}

/**
 * Содержимое списка паролей
 */
export type Passwords = Record<Id, Password>

export interface NewOrder {
    user_id: User['id']
    products: Record<Product['id'], number>
    total_price: number
    pay_type: "online" | "offline",
    address: string
}

export interface EditedOrder {
    id: keyof Orders
    user_id: User['id']
    products?: Record<Product['id'], number>
    total_price?: number
    created_at?: number
    date?: string
    pay_type?: "online" | "offline"
    status?: 'created' | 'in-work' | 'delivery' | 'closed'
    address?: string
}

export interface Order {
    id: keyof Orders
    user_id: User['id']
    products: Record<Product['id'], number>
    total_price: number
    created_at: number
    date: string
    pay_type: "online" | "offline"
    status: 'created' | 'in-work' | 'delivery' | 'closed'
    address: string
}

export type Orders = Record<Id, Order>

/**
 * Содержимое локального хранилища
 */
export interface Data {
    users: Users,
    products: Products,
    favorites: Favorites,
    carts: Carts,
    passwords: Passwords,
    active_session: Id,
    new_user_id: Id,
    new_product_id: Id,
    orders: Orders,
    new_order_id: Id
}

/**
 * Возвращаемое функцией
 */
export type ReturnGetUser = {
    result: false;
    reason: 0 | 1;
} | {
    result: true;
    user: User;
}

export type ReturnRegUser = {
    result: false
} | {
    result: true,
    user: User
}