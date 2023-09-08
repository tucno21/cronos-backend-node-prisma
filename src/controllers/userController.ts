import { Request, Response } from 'express';
import prisma from '../database/prisma';
import { generateJWT } from '../helpers/jwt';
import fileSave from '../helpers/fileSave';
import bcrypt from 'bcryptjs';
import fileDelete from '../helpers/fileDelete';



export const getUsers = async (req: Request, res: Response) => {

    const usuarios = await prisma.usuario.findMany()

    const folderName = process.env.FOLDER_NAME || 'imagenes';
    // url de imagen
    const url = `${req.protocol}://${req.get('host')}/${folderName}/`;

    const usuariosConImagen = usuarios.map(user => {
        const nuevaImagen = url + user.imagen;
        const dataUser = {
            ...user,
            imagen: nuevaImagen
        }
        return dataUser;
    })

    return res.json({
        status: 'success',
        message: 'Lista de usuarios',
        data: usuariosConImagen,
    });
}

export const getUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await prisma.usuario.findUnique({ where: { id: Number(id) } });
    if (!user) return res.status(400).json({ status: 'error', message: 'No existe el usuario' });

    const folderName = process.env.FOLDER_NAME || 'imagenes';
    // url de imagen
    const url = `${req.protocol}://${req.get('host')}/${folderName}/`;
    user.imagen = url + user.imagen;

    return res.json({
        status: 'success',
        message: 'Usuario encontrado',
        data: user
    })
}

export const createUser = async (req: Request, res: Response) => {
    try {
        const { body } = req;

        //buscar si el email existe
        // buscar si el email existe
        const existe = await prisma.usuario.findFirst({ where: { email: body.email } });
        if (existe) return res.status(400).json({ status: 'error', message: 'El usuario ya existe' })


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

        //guardar usuario
        const usuario = await prisma.usuario.create({ data: body });

        //generar el token
        const token = await generateJWT({ uid: usuario.id, email: usuario.email });

        //url de imagen
        const url = `${req.protocol}://${req.get('host')}/${process.env.FOLDER_NAME || 'imagenes'}/`;
        usuario.imagen = url + usuario.imagen;

        const usuarioResponse = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            imagen: usuario.imagen,
        };

        return res.json({
            status: 'success',
            message: 'Usuario creado correctamente',
            data: usuarioResponse,
            token
        });

    } catch (error) {
        if (error instanceof Error) {
            // Si el error es una instancia de la clase Error, entonces sabemos que es un objeto de error válido.
            return res.status(500).json({
                status: 'error',
                message: 'Error en el servidor',
                error: error.message
            });
        } else {
            // Si el error no es una instancia de Error, puedes manejarlo de otra manera o simplemente devolver un mensaje genérico.
            return res.status(500).json({
                status: 'error',
                message: 'Error en el servidor',
                error: 'Error desconocido'
            });
        }
    }
}

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { body } = req;


    const usuario = await prisma.usuario.findUnique({ where: { id: Number(id) } });
    if (!usuario) return res.status(400).json({ status: 'error', message: 'No existe el usuario' });


    if (req.files) {
        const result = fileSave({ file: req.files!, fieldName: ['imagen'] });
        if ('error' in result) return res.status(400).json(result);
        const { imagen } = result.nameFiles;

        // eliminar la imagen anterior
        fileDelete(usuario.imagen);

        //agregar imagen a body
        body.imagen = imagen;
    }

    if (body.password) {
        //encriptar password
        const salt = bcrypt.genSaltSync();
        body.password = bcrypt.hashSync(body.password, salt);
    }

    //actualizar usuario
    const userUpdate = await prisma.usuario.update({ where: { id: Number(id) }, data: body });

    //url de imagen
    const url = `${req.protocol}://${req.get('host')}/${process.env.FOLDER_NAME || 'imagenes'}/`;
    userUpdate.imagen = url + (req.files ? userUpdate.imagen : usuario.imagen);

    return res.json({
        status: 'success',
        message: 'Usuario actualizado correctamente',
        data: userUpdate
    });
}

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const usuario = await prisma.usuario.findUnique({ where: { id: Number(id) } });
    if (!usuario) return res.status(400).json({ status: 'error', message: 'No existe el usuario' });
    // eliminar la imagen
    fileDelete(usuario.imagen);
    //eliminar usuario
    await prisma.usuario.delete({ where: { id: Number(id) } });
    return res.json({ status: 'success', message: 'Usuario eliminado correctamente', })
}