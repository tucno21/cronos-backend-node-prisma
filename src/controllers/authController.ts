import { Request, Response } from 'express';
import prisma from '../database/prisma';
import { generateJWT } from '../helpers/jwt';
import fileSave from '../helpers/fileSave';
import bcrypt from 'bcryptjs';


export const getUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const usuario = await prisma.usuario.findFirst({ where: { email: email } });
        if (!usuario) return res.status(400).json({ status: 'error', message: 'El usuario no existe' })

        // verificar password
        const validarPassword = bcrypt.compareSync(password, usuario.password);
        if (!validarPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'La contraseña es incorrecta'
            });
        }

        //generar el token
        const token = await generateJWT({ uid: usuario.id, email: usuario.email });

        const usuarioResponse = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            imagen: usuario.imagen,
        };

        return res.json({
            status: 'success',
            message: 'Usuario logueado correctamente',
            data: usuarioResponse,
            token
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

export const createUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { body } = req;
        // buscar si el email existe
        const existe = await prisma.usuario.findFirst({ where: { email: body.email } });
        if (existe) return res.status(400).json({ status: 'error', message: 'El usuario ya existe' })

        //tratamiendo de la imagen
        const images = req.files;
        const result = fileSave({ file: images!, fieldName: ['imagen'] });

        if ('error' in result) return res.status(400).json({
            status: 'error',
            message: 'Error al guardar imagen',
            data: result.error
        });

        const { imagen } = result.nameFiles;
        //agregar imagen a body
        body.imagen = imagen;

        //encriptar password
        const salt = bcrypt.genSaltSync();
        body.password = bcrypt.hashSync(body.password, salt);

        // guardar usuario
        const usuario = await prisma.usuario.create({ data: body });

        const usuarioResponse = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            imagen: usuario.imagen,
        };

        // generar el token
        const token = await generateJWT({ uid: usuario.id, email: usuario.email });

        return res.json({
            status: 'success',
            message: 'Usuario creado correctamente',
            data: usuarioResponse,
            token
        });

    } catch (error: any) {
        return res.status(500).json({
            msg: 'Error en el servidor',
            error: error.message
        });
    }
}
