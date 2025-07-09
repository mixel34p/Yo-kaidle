# Changelog: Restricciones de Tribus Yokai

## Resumen de Cambios

Se han implementado restricciones para controlar qué yokais pueden aparecer en los diferentes modos de juego, específicamente para excluir yokais de la tribu "Boss".

## Cambios Implementados

### 1. Modo Diario - Exclusión Automática de Tribus Boss

**Archivo modificado:** `src/lib/supabase.ts`

- **Función `getDailyYokai()`**: Ahora excluye automáticamente todos los yokais de la tribu "Boss" del modo diario.
- **Razón**: Mantener un nivel de dificultad equilibrado en el desafío diario.
- **Implementación**: Se añadió `.neq('tribe', 'Boss')` a la consulta de Supabase.

```typescript
// Antes
const { data, error } = await supabase
  .from('yokai')
  .select('*');

// Después  
const { data, error } = await supabase
  .from('yokai')
  .select('*')
  .neq('tribe', 'Boss'); // Excluir yokais de la tribu Boss en modo diario
```

### 2. Modo Infinito - Configuración Opcional

**Archivos modificados:**
- `src/lib/supabase.ts`
- `src/utils/gameSourcePreferences.ts`
- `src/app/page.tsx`
- `src/components/TribeRestrictionsSelector.tsx` (nuevo)

#### Nuevas Funcionalidades:

1. **Sistema de Preferencias de Restricciones**:
   - Nueva interfaz `TribeRestrictions` para configurar restricciones
   - Funciones para guardar/cargar preferencias en localStorage
   - Opción `excludeBossTribes` para controlar la exclusión en modo infinito

2. **Función `getRandomYokai()` Mejorada**:
   - Nuevo parámetro opcional `excludeBossTribes?: boolean`
   - Aplica filtro de exclusión cuando está habilitado
   - Mantiene compatibilidad con código existente

3. **Componente de Configuración**:
   - `TribeRestrictionsSelector`: Interfaz para configurar restricciones
   - Toggle visual para activar/desactivar exclusión de tribus Boss
   - Información contextual sobre el comportamiento en modo diario

4. **Integración en la Interfaz**:
   - Añadido al modal de configuración del modo infinito
   - Persistencia automática de preferencias
   - Carga automática de configuración guardada

### 3. Modo Duelo - Sin Restricciones

**Archivo modificado:** `src/lib/duelSupabase.ts`

- Los duelos mantienen acceso a todos los yokais, incluyendo tribus Boss
- Se actualizaron las llamadas de fallback para no aplicar restricciones

## Estructura de Archivos Nuevos/Modificados

```
src/
├── components/
│   └── TribeRestrictionsSelector.tsx (NUEVO)
├── lib/
│   ├── supabase.ts (MODIFICADO)
│   └── duelSupabase.ts (MODIFICADO)
├── utils/
│   └── gameSourcePreferences.ts (MODIFICADO)
└── app/
    └── page.tsx (MODIFICADO)
```

## Comportamiento por Modo de Juego

| Modo | Tribus Boss | Configuración |
|------|-------------|---------------|
| **Diario** | ❌ Siempre excluidas | No configurable |
| **Infinito** | ⚙️ Configurable | Toggle en configuración |
| **Duelo** | ✅ Siempre incluidas | No configurable |

## Configuración de Usuario

Las preferencias se almacenan en localStorage con la clave `yokaidle_tribe_restrictions`:

```typescript
interface TribeRestrictions {
  excludeBossTribes: boolean; // Para modo infinito
}
```

**Valor por defecto**: `{ excludeBossTribes: false }`

## Compatibilidad

- ✅ Totalmente compatible con versiones anteriores
- ✅ No afecta partidas guardadas existentes
- ✅ Configuración opcional (por defecto incluye todos los yokais)
- ✅ Funciona sin configuración previa

## Notas Técnicas

1. **Determinismo en Modo Diario**: La exclusión de tribus Boss no afecta el algoritmo determinístico, solo reduce el pool de yokais disponibles.

2. **Performance**: Las consultas de base de datos mantienen la misma eficiencia con el filtro adicional.

3. **Extensibilidad**: El sistema está diseñado para permitir fácilmente más tipos de restricciones en el futuro.

## Actualización: Juegos Deshabilitados

### Cambios Adicionales Implementados

**Archivo modificado:** `src/components/GameSourceSelector.tsx` y `src/app/page.tsx`

#### Juegos Deshabilitados:
- **Yo-kai Watch 4**: Deshabilitado (ya estaba)
- **Yo-kai Watch Busters 2**: Deshabilitado (nuevo)

#### Mejoras en la Lógica:
1. **Botón "Todos" Corregido**: Ahora solo selecciona juegos habilitados
2. **Inicialización Mejorada**: Por defecto solo selecciona juegos habilitados
3. **Persistencia Inteligente**: Filtra juegos deshabilitados de configuraciones guardadas
4. **Código Más Mantenible**: Lista centralizada de juegos deshabilitados

#### Juegos Disponibles por Estado:

| Juego | Estado | Seleccionable |
|-------|--------|---------------|
| Yo-kai Watch 1 | ✅ Habilitado | Sí |
| Yo-kai Watch 2 | ✅ Habilitado | Sí |
| Yo-kai Watch 3 | ✅ Habilitado | Sí |
| Yo-kai Watch 4 | ❌ Deshabilitado | No (Próximamente) |
| Yo-kai Watch Blasters | ✅ Habilitado | Sí |
| Yo-kai Watch Busters 2 | ❌ Deshabilitado | No (Próximamente) |
| Yo-kai Watch Sangokushi | ✅ Habilitado | Sí |

## Próximas Mejoras Sugeridas

- [ ] Restricciones por rango (ej: excluir SSS)
- [ ] Restricciones por elemento
- [ ] Restricciones por juego de origen
- [ ] Presets de dificultad predefinidos
