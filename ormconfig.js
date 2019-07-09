module.exports = {
    "type": process.env.TYPE,
    "host": process.env.DATABASE_HOST,
    "port": process.env.DATABASE_PORT,
    "username": process.env.DATABASE_USERNAME,
    "password": process.env.DATABASE_PASSWORD,
    "database": process.env.DATABASE,
    "entities": [process.env.ENTITIES],
    "entityPrefix": process.env.ENTITYPREFIX,
}
