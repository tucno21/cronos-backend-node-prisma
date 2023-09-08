import { PrismaClient } from "@prisma/client";
import { etiquetas } from "./etiquetas";

const prisma = new PrismaClient();

const main = async () => {
    try {
        await prisma.etiqueta.createMany({
            data: etiquetas,
        });
        // await prisma.producto.createMany({
        //     data: productos,
        // });
    } catch (error) {
        console.log(error);
    }
}

main()