import { reactive } from "vue";
import type { Id, NewUser, ReturnGetUser, ReturnRegUser, User } from "./types";
import { data } from "./useLS";
import { checkPassword, setPassword } from "./usePassword";

export const guest = {
    id: -1,
    login: "",
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    root: -1
}

export const user = reactive<User>(
    { ...guest }
)

/**
 * Принимает нового пользователя
 * Проверяет существует ли логин среди пользователей
 * Сохраняет пользователя с доп данными
 * Возвращает или не возвращает пользователя
 */
export function createUser(user: NewUser, password: string): ReturnRegUser {
    const users = data.users
    let flag = Object.values(users).some((value) => {
        return value.login == user.login
    })
    if (flag) return { result: false }
    const new_user_id = data.new_user_id
    users[new_user_id] = { id: new_user_id, ...user, root: 0 }
    setPassword(new_user_id, password)
    data.new_user_id++
    return { result: true, user: users[new_user_id] }
}


/**
 * Возвращает id пользователя если такой логин существует, иначе null
 */
export function existLogin(login: string) {
    const users = data.users
    let id: null | Id = null
    Object.values(users).some((value) => {
        if (value.login === login) {
            id = value.id
            return true
        }
    })
    return id
}

/**
 * Принимает логин и пароль
 * Проверяет существует ли логин среди пользователей
 * Проверяет совпадает ли пароль с тем что присвоен пользователю
 * Возвращает либо причину по которой пользователь не выдан, либо пользователя
 */
export function getUserFromLoginPassword(login: string, password: string): ReturnGetUser {
    const users = data.users
    let id: number | null = existLogin(login)
    if (id === null) return { result: false, reason: 0 }
    if (!checkPassword(id, password)) return { result: false, reason: 1 }
    return { result: true, user: users[id] }
}

/**
 * Проверяет есть ли активная сессия
 * Проверяет существует ли пользователь с id записанным в активной сессии
 * Присваевает клиенту пользователя
 */
export function setUserFromActiveSession(): void {
    if (data.active_session == -1) return
    const dataUser = data.users[data.active_session]
    if (!dataUser.login) return
    Object.assign(user, dataUser)
}

export function exitFromUser() {
    data.active_session = -1
    Object.assign(user, guest)
}

export function editUser(fn_user: User) {
    const id = existLogin(fn_user.login)
    if (id !== null && id !== fn_user.id) return { result: false }
    data.users[fn_user.id] = fn_user
    return { result: true }
}

export function deleteUser(id: number) {
    delete (data.users[id])
}