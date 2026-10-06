import type { Id, Password } from "./types";
import { data } from "./useLS";

export function setPassword(id: Id, password: Password) {
    data.passwords[id] = password
}

export function checkPassword(id: Id, password: Password) {
    return data.passwords[id] == password
}