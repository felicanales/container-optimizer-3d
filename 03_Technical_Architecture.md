
1. Frontend

---

Tecnologías:

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Three Fiber
- Three.js

---

2. Backend

---

Tecnologías:

- FastAPI
- Python
- Pydantic

---

3. Base de datos

---

Tecnología:

- PostgreSQL
- Supabase

Tablas iniciales:

- containers
- products
- simulations
- placements

La base de datos puede agregarse después de tener funcionando el flujo básico de simulación.

---

4. Flujo principal de la aplicación

---

1. El usuario ingresa las dimensiones del contenedor.
2. El usuario ingresa los productos:
   - Nombre.
   - Ancho.
   - Alto.
   - Profundidad.
   - Peso.
   - Cantidad.
   - Si es frágil.
   - Si es apilable.
3. El usuario presiona "Ejecutar simulación".
4. El frontend envía los datos al backend.
5. El backend valida los datos.
6. El backend ejecuta el algoritmo de carga.
7. El backend calcula:
   - Productos cargados.
   - Productos no cargados.
   - Posiciones dentro del contenedor.
   - Porcentaje de ocupación.
8. El backend responde al frontend.
9. El frontend muestra:
   - Visualización 3D del contenedor.
   - Métricas de ocupación.
   - Lista de productos cargados.
   - Lista de productos no cargados.

---

5. Arquitectura simple

---

Frontend:
Next.js + React + React Three Fiber

Backend:
FastAPI + Python

Base de datos:
Supabase/PostgreSQL

Flujo:
Usuario -> Frontend -> Backend -> Algoritmo -> Frontend -> Visualización 3D
