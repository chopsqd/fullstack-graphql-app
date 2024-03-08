import {UsernamePasswordInput} from "../types/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
    if (!options.email.includes('@')) {
        return [
            {
                field: 'email',
                message: 'Invalid email'
            }
        ]
    }

    if (options.username.length <= 2) {
        return [
            {
                field: 'username',
                message: 'Length must be greater than 2'
            }
        ]
    }

    if (options.username.includes('@')) {
        return [
            {
                field: 'username',
                message: 'Username cannot include an @'
            }
        ]
    }

    if (options.password.length <= 5) {
        return [
            {
                field: 'password',
                message: 'Length must be greater than 5'
            }
        ]
    }

    return null
}
