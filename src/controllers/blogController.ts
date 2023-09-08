import { Request, Response } from 'express';
import prisma from '../database/prisma';



export const getBlogs = async (_req: Request, res: Response) => {
    try {
        //traemos todos los blogs relacionados con sus etiquetas
        const blogs = await prisma.blog.findMany({
            include: {
                autor: {
                    select: {
                        id: true,
                        nombre: true,
                        imagen: true
                    }
                },
                etiquetas: true,
            }
        })


        return res.json({
            status: 'success',
            message: 'Blogs encontrados',
            data: blogs
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const getBlog = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        //traemos todos los blogs relacionados con sus etiquetas
        const blog = await prisma.blog.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                autor: {
                    select: {
                        id: true,
                        nombre: true,
                        imagen: true
                    }
                },
                etiquetas: true,
            }
        });

        if (!blog) return res.status(404).json({ status: 'error', message: 'Blog no encontrado' })

        return res.json({
            status: 'success',
            message: 'Blog encontrado',
            data: blog
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const createBlog = async (req: Request, res: Response) => {
    try {
        const { titulo, contenido, userId, etiquetas } = req.body;

        //crear blog relacionado con sus etiquetas
        const blog = await prisma.blog.create({
            data: {
                titulo,
                contenido,
                userId: Number(userId),
                etiquetas: {
                    connect: etiquetas.map((id: number) => ({ id: Number(id) }))
                }
            },
            include: {
                etiquetas: true
            }
        })

        return res.json({
            status: 'success',
            message: 'Blog creado',
            data: blog,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const updateBlog = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { titulo, contenido, userId, etiquetas } = req.body;

        //buscamos blog
        const datablog = await prisma.blog.findUnique({ where: { id: Number(id) }, include: { etiquetas: true } })
        if (!datablog) return res.status(404).json({ status: 'error', message: 'Blog no encontrado' })


        //actualizamos blog relacionado con sus etiquetas
        const blog = await prisma.blog.update({
            where: {
                id: Number(id)
            },
            data: {
                titulo,
                contenido,
                userId: Number(userId),
                etiquetas: {
                    disconnect: datablog.etiquetas.map((item: { id: number; nombre: string; }) => ({ id: item.id })), //eliminamos las relaciones que tiene
                    connect: etiquetas.map((id: number) => ({ id: Number(id) })),//agregamos las nuevas relaciones
                }
            },
            include: {
                autor: {
                    select: {//seleccionamos solo los datos que necesitamos
                        id: true,
                        nombre: true,
                        imagen: true
                    }
                },
                etiquetas: true, //seleccionamos las etiquetas
            }
        })

        return res.json({
            status: 'success',
            message: 'Blog creado',
            data: blog,
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const deleteBlog = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        //buscamos blog
        const datablog = await prisma.blog.findUnique({ where: { id: Number(id) } })
        if (!datablog) return res.status(404).json({ status: 'error', message: 'Blog no encontrado' })
        //eliminamos blog
        await prisma.blog.delete({ where: { id: Number(id) } })
        return res.json({ status: 'success', message: 'Blog eliminado' })
    } catch (error) {
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}