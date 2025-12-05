# Marcos de Avatar - Imágenes

Esta carpeta contiene las imágenes de los marcos que se superponen sobre los avatares de los usuarios.

## Formato de las imágenes

- **Formato**: PNG con transparencia
- **Tamaño recomendado**: 256x256 píxeles o superior
- **Forma**: Circular (el centro debe estar transparente para mostrar el avatar)
- **Estilo**: El marco debe ser un anillo/borde decorativo

## Archivos necesarios

Según la configuración actual en `src/utils/framesManager.ts`, se necesitan las siguientes imágenes:

- `default.png` - Marco básico (puede ser transparente o muy sutil)
- `bronze.png` - Marco de bronce
- `silver.png` - Marco de plata  
- `gold.png` - Marco de oro
- `legendary.png` - Marco legendario

## Ejemplo de estructura

```
public/frames/
├── default.png
├── bronze.png
├── silver.png
├── gold.png
└── legendary.png
```

## Cómo crear un marco

1. Crea una imagen PNG de 256x256 píxeles
2. El centro debe ser transparente (círculo de ~180px de diámetro)
3. El marco decorativo debe estar en los bordes
4. Guarda con el nombre correspondiente al ID del marco
5. Coloca el archivo en esta carpeta

## Ejemplo de diseño

```
┌─────────────────────┐
│ ████████████████████ │ ← Decoración del marco
│ ██              ██ │
│ ██   (avatar)   ██ │ ← Centro transparente
│ ██              ██ │
│ ████████████████████ │ ← Decoración del marco
└─────────────────────┘
```

El avatar del usuario se mostrará en el centro transparente, y el marco se superpondrá como decoración.
