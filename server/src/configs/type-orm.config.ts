import {Post} from "../entities/Post";
import {User} from "../entities/User";

export default {
    type: 'postgres',
    database: 'postgres',
    username: 'postgres',
    password: '12345',
    logging: true,
    synchronize: true,
    entities: [Post, User]
}
