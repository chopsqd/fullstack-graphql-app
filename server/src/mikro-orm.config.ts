import {Post} from "./entities/Post";
import {__prod__} from "./constants";
import {MikroORM} from "@mikro-orm/core"
import path from "path"
import {PostgreSqlDriver} from "@mikro-orm/postgresql";
import {Migrator} from "@mikro-orm/migrations";

export default {
    migrations: {
        path: path.join(__dirname, './migrations',),
        glob: '!(*.d).{js,ts}'
    },
    allowGlobalContext: true,
    user: 'postgres',
    password: '12345',
    driver: PostgreSqlDriver,
    entities: [Post],
    dbName: 'postgres',
    extensions: [Migrator],
    debug: !__prod__
} as Parameters<typeof MikroORM.init>[0]
