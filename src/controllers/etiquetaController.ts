import { Request, Response } from 'express';
import prisma from '../database/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


export const getEtiquetas = async (_req: Request, res: Response) => {
    try {

        const etiquetas = await prisma.etiqueta.findMany()
        return res.json({
            status: 'success',
            message: 'Lista de etiquetas',
            data: etiquetas
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const getEtiqueta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const etiqueta = await prisma.etiqueta.findUnique({ where: { id: Number(id) } });
        if (!etiqueta) return res.status(404).json({ status: 'error', message: 'No existe el Etiqueta' })
        return res.json({
            status: 'success',
            message: 'Etiqueta',
            data: etiqueta
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const createEtiqueta = async (req: Request, res: Response) => {
    try {
        const { nombre } = req.body;
        const etiqueta = await prisma.etiqueta.create({ data: { nombre } })

        return res.json({
            status: 'success',
            message: 'Etiqueta creado correctamente',
            data: etiqueta
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const updateEtiqueta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const etiqueta = await prisma.etiqueta.findUnique({ where: { id: Number(id) } });
        if (!etiqueta) return res.status(404).json({ status: 'error', message: 'No existe el Etiqueta' })
        const updateEtiqueta = await prisma.etiqueta.update({ where: { id: Number(id) }, data: { nombre } })
        return res.json({
            status: 'success',
            message: 'Etiqueta actualizado correctamente',
            data: updateEtiqueta
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const deleteEtiqueta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // const etiqueta = await prisma.etiqueta.findUnique({ where: { id: Number(id) } });
        // if (!etiqueta) return res.status(404).json({ status: 'error', message: 'No existe el Etiqueta' })
        await prisma.etiqueta.delete({ where: { id: Number(id) } })
        return res.json({ status: 'success', message: 'Etiqueta eliminado correctamente' })

    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ status: 'error', message: 'No existe el Etiqueta' })
        }

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}