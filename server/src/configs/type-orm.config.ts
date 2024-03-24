import path from "path";
import {Post} from "../entities/Post";
import {User} from "../entities/User";

export default {
    type: 'postgres',
    database: 'postgres',
    username: 'postgres',
    password: '12345',
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "../migrations/*")],
    entities: [Post, User]
}
