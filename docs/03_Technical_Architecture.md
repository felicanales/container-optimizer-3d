# Arquitectura tecnica

## 1. Frontend

Tecnologias:

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Three Fiber
- Three.js

Responsabilidades:

- Formularios para configurar contenedor y productos.
- Envio de datos al backend.
- Visualizacion de metricas.
- Render 3D del resultado.

La logica principal de packing no debe vivir en el frontend.

## 2. Backend

Tecnologias:

- FastAPI
- Python
- Pydantic

Responsabilidades:

- Validar payloads.
- Ejecutar la simulacion.
- Calcular posiciones.
- Calcular ocupacion, peso cargado y productos no cargados.
- Devolver JSON estructurado.

## 3. Base de datos

Tecnologia futura:

- PostgreSQL
- Supabase

Tablas iniciales sugeridas:

- `containers`
- `products`
- `simulations`
- `placements`

La base de datos se agrega despues de tener funcionando el flujo basico de simulacion.

## 4. Flujo principal

1. El usuario ingresa las dimensiones del contenedor.
2. El usuario ingresa productos con dimensiones, peso, cantidad, fragilidad y apilabilidad.
3. El usuario ejecuta la simulacion.
4. El frontend envia el payload al backend.
5. El backend valida datos y ejecuta el algoritmo.
6. El backend responde con posiciones, metricas y productos no cargados.
7. El frontend renderiza la escena 3D y las listas de resultados.

```txt
Usuario -> Frontend -> Backend -> Algoritmo -> Frontend -> Visualizacion 3D
```
