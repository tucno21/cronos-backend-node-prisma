# CRONOS BACKEND NODE JS PRISMA

## Requirimientos

- node >= 18.0.0


### Directorio de carpetas:

```
📁 backend
├───📁 public/
│   └───📄 index.hmtl
├───📁 src/
│   └───📁 controllers/
│   |   └────📄 authController.ts
│   └───📁 controllers/
│   |   └────📄 core.ts
│   |   └────📄 route.ts
│   |   └────📄 server.ts
│   └───📁 database/
│   |   └────📄 sequelize.ts
│   └───📁 helpers/
│   |   └────📄 jwt.ts
│   └───📁 middlewares/
│   |   └────📄 validarCampos.ts
│   |   └────📄 validarJwt.ts
│   └───📁 model/
│   |   └────📄 blog.ts
│   └───📁 router/
│       └────📄 blogs.ts
├───📄 .gitignore
├───📄 app.ts
├───📄 blog.sql
├───📄 package.json
├───📄 tsconfig.json
└───📄 .env.example
```

## **Índice**

- [Instalación](#instalacion)
- [Rutas web](#rutas-web)
- [Rutas con middlewares](#rutas-con-middlewares)
- [HTTP request](#http-request)
- [Encriptar el password](#encriptar-el-password)
- [Almacenar Imagenes](#almacenar-imagenes)
- [Generar Tocken](#generar-tocken)
- [Crear Modelos](#crear-modelos)


## Instalación

- Clonar el repositorio
- Ejecutar el comando `npm install`
- Crear un archivo `.env` en la raiz del proyecto
- Configurar el archivo `.env` con los datos de la base de datos

## Rutas web
[☝️Inicio](#cronos-backend-node-js-prisma)

en la carpeta `router` crear el archivo.ts y el nombre de este archivo es parte de la ruta api
por ejemplo archivo `blogs.ts` y la url quedaria determinado de la siguiente forma

```
http://192.168.158.206:8000/api/blogs
```

```javascript
import { Router } from 'express';
import { createBlog, deleteBlog, getBlog, getBlogs, updateBlog } from '../controllers/blogController';

const router = Router();

router.get('/', getBlogs);
router.get('/:id', getBlog);
router.post('/', createBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);

export default router;
```


## Rutas con middlewares
[☝️Inicio](#cronos-backend-node-js-prisma)

en la carpeta middlewares se tiene para validar el token y procesar con express-validator

```javascript
import { check } from 'express-validator';
import { validarCampos } from '../middlewares/validarCampos';
import { validarJWT } from '../middlewares/validarJwt';

const fields = {
    email: check('email', 'El email es obligatorio').not().isEmpty(),
    password: check('password', 'La contraseña es obligatoria').not().isEmpty(),
    nombre: check('nombre', 'El nombre es obligatorio').not().isEmpty(),
}

//CRUD de usuarios
router.get('/', [validarJWT], getUsers);
router.get('/:id', [validarJWT], getUser);
router.post('/', [validarJWT, fields.nombre, fields.email, fields.password, validarCampos], createUser);
router.put('/:id', [validarJWT, fields.nombre, fields.email, validarCampos], updateUser);
router.delete('/:id', [validarJWT], deleteUser);
```


## HTTP request
[☝️Inicio](#cronos-backend-node-js-prisma)
forma de obtener lo que envia por POST PUT DELETE
```javascript
export const getUser = async (req: Request, res: Response) => {
    const { id } = req.params; //mediante url
    const {name, email} = req.body //mediante post
    const files = req.files  //arrar de imagenes
}
```

## Encriptar el password
[☝️Inicio](#cronos-backend-node-js-prisma)
hacer uso de bcrypt
```javascript
import bcrypt from 'bcryptjs';
    const salt = bcrypt.genSaltSync();
    body.password = bcrypt.hashSync(body.password, salt);
```

## Almacenar Imagenes
[☝️Inicio](#cronos-backend-node-js-prisma)
usar la funcion fileSave() esta funcion almacena la imagen y retorna los nombres del archivo
```javascript
//le enviamo toto lo que venga del Request
const images = req.files;
//el segundo paramatro es el array con el nombre o nombres a evaluar de los inputs
const result = fileSave({ file: images!, fieldName: ['imagen'] });

//file save acepta dos parametros mas que son opcionales
//allowedTypes: verifica las extenciones permitidas ejemplo 'jpg' , 'png', etc
//cuarto parametro si se cambia por update, este deja de verifcar que todos los nombres del array se cumplan
const result = fileSave ({ file, fieldName, allowedTypes = [], mode = 'create' }) 

//FORM DE RETONO DE fileSave()
// "result" puede ser error | nameFiles
        if ('error' in result) return res.status(400).json({
            status: 'error',
            message: 'Error al guardar imagen',
            data: result.error
        });

//si todo esta bien obtenemos el nombre
        const { imagen } = result.nameFiles;


//ELIMINAR IMAGEN
import fileDelete from '../helpers/fileDelete';
//enviar el nombre de la imagen
fileDelete(usuario.imagen);
```


## Generar Tocken
[☝️Inicio](#cronos-backend-node-js-prisma)
hacer uso de la funcion generateJWT()
```javascript
import { generateJWT } from '../helpers/jwt';
const token = await generateJWT({ uid: usuario.id, email: usuario.email });
```

## Crear Modelos
[☝️Inicio](#cronos-backend-node-js-prisma)
en la carpeta prisma/schema.prisma agregar sus modelos
```javascript
model Usuario {
  id       Int    @id @default(autoincrement())
  nombre   String @db.VarChar(60)
  email    String @db.VarChar(60)
  password String @db.VarChar(60)
  imagen   String @db.VarChar(120)
  blogs    Blog[] // Indica que un usuario puede tener varios blogs relacionados
}
```

luego mediante la consola de comandos puede cambiar el "init"
```
npx prisma migrate dev --name init
```


## SEED
para importar datos desde la carpeta seed
cree su acchivo de datos e importe el el archivvo seed.ts

y ejecute el comando
```
npx prisma db seed
```

## RESET BD
y ejecute el comando
```
npx prisma migrate reset
```
