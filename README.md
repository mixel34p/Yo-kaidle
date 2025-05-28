# Yo-kaidle

Un juego de adivinanzas diarias basado en el universo de Yo-kai Watch, inspirado en Wordle. Cada día, los jugadores intentan adivinar un Yo-kai utilizando pistas relacionadas con sus características, como tribu, rango, elemento, altura, peso y número en el Medallium.

## Características

- Un Yo-kai diario para adivinar
- Pistas visuales que indican si las características son correctas o cómo se comparan con el Yo-kai objetivo
- Seguimiento de estadísticas (racha actual, racha máxima, porcentaje de victorias, etc.)
- Interfaz intuitiva y atractiva inspirada en el estilo de Yo-kai Watch

## Tecnologías utilizadas

- Next.js para el frontend
- TypeScript para seguridad de tipos
- Tailwind CSS para estilos
- Supabase como backend para almacenar la información de los Yo-kai

## Configuración del proyecto

### Requisitos previos

- Node.js (v14 o superior)
- Cuenta de Supabase (gratuita)

### Pasos para la configuración

1. Clona este repositorio
2. Instala las dependencias:
   ```
   npm install
   ```
3. Crea un archivo `.env.local` basado en `.env.local.example` y añade tus credenciales de Supabase
4. Crea una base de datos en Supabase con la tabla `yokai` que contenga los siguientes campos:
   - id (int, primary key)
   - name (text)
   - tribe (text)
   - rank (text)
   - element (text)
   - medalNumber (int)
   - game (text)
   - imageUrl (text)
5. Inicia el servidor de desarrollo:
   ```
   npm run dev
   ```

## Estructura de Supabase

Para que la aplicación funcione correctamente, necesitarás configurar Supabase con la siguiente estructura:

1. Crea una tabla `yokai` con los campos mencionados anteriormente
2. Importa datos de Yo-kai o crea algunos manualmente para pruebas

## Desarrollo

Para añadir más características o realizar modificaciones:

```
npm run dev
```

## Despliegue

Para construir la aplicación para producción:

```
npm run build
npm run start
```

También puedes desplegar fácilmente en Vercel, Netlify o cualquier otro servicio compatible con Next.js.

## Licencia

[MIT](LICENSE)
