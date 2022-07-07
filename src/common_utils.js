
export class EE {

    // listeners = {
    //    "eventName1": [fn1, fn2],
    //    "eventName2": [fn3, fn4]
    // }
    #listeners = {};

    on(eventName, fn) {
        this.#listeners[eventName] ? this.#listeners[eventName].push(fn) : this.#listeners[eventName] = [fn];
    }

    off(eventName) {
        if (this.#listeners[eventName]) {
            this.#listeners[eventName].pop()
            if (this.#listeners[eventName].length === 0) {
                delete this.#listeners[eventName]
            }
        }
    }

    offAll(eventName) {
        if (this.#listeners[eventName]) {
            delete this.#listeners[eventName]
        }
    }

    emit(eventName, ...args) {
        if (this.#listeners[eventName]) {
            this.#listeners[eventName].forEach(listener => {
                listener(...args)
            })
        }
    }

    hasListeners(eventName) {
        return typeof (this.#listeners[eventName]) !== "undefined"
    }
}