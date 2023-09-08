import dotenv from 'dotenv';
dotenv.config();

export const AppConfig = {
    PORT: process.env.PORT || '8081',
    INIT_PATH: `/${process.env.NAME_INIT_PATH}` || '/api',
    SOCKET_IO_ENABLED: process.env.SOCKET_IO === 'on',
};

export const paramConnect = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'cronos',
    port: parseInt(process.env.DB_PORT || '3306')
}