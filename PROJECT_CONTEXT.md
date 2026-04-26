# PROJECT_CONTEXT.md

# Container Optimizer 3D

## 1. Descripción general del proyecto

Container Optimizer 3D es una aplicación web interactiva tipo simulador/juego que permite organizar productos dentro de un contenedor, optimizando el uso del espacio mediante algoritmos de 3D bin packing.

El objetivo principal es ayudar a planificar la carga de productos en un contenedor antes de realizar una importación real, entregando una visualización 3D clara del resultado y métricas útiles para la toma de decisiones.

El proyecto está pensado inicialmente para una empresa que importa productos desde Marruecos hacia Chile. Los productos pueden incluir alfombras, muebles, adornos, cajas u otros objetos con dimensiones y restricciones logísticas.

---

## 2. Objetivo del producto

El objetivo del producto es maximizar el uso del volumen disponible dentro de un contenedor, considerando restricciones como:

- Dimensiones del contenedor.
- Dimensiones de los productos.
- Cantidad de productos.
- Peso.
- Fragilidad.
- Apilabilidad.
- Rotaciones permitidas.
- Productos cargados y no cargados.
- Porcentaje de ocupación.
- Visualización 3D del resultado.

El MVP debe priorizar una simulación funcional, visual y clara antes que una optimización matemática perfecta.

---

## 3. Usuario objetivo

El usuario objetivo inicial es una empresa importadora que necesita planificar cómo cargar productos en un contenedor marítimo.

Casos típicos:

- Cargar alfombras, muebles y adornos.
- Ver si todos los productos caben en un contenedor.
- Comparar diferentes combinaciones de productos.
- Evaluar el porcentaje de ocupación del contenedor.
- Identificar productos que no pudieron ser cargados.
- Generar reportes para planificación logística.

---

## 4. Alcance del MVP

El MVP debe permitir:

- Crear o configurar un contenedor con dimensiones.
- Crear productos o cajas.
- Ingresar cantidad por producto.
- Definir peso por producto.
- Definir si un producto es frágil.
- Definir si un producto es apilable.
- Configurar rotaciones permitidas.
- Ejecutar una simulación de carga.
- Visualizar el resultado en 3D.
- Mostrar porcentaje de ocupación.
- Mostrar productos cargados.
- Mostrar productos no cargados.
- Mostrar posiciones de los productos dentro del contenedor.

Funcionalidades posteriores, no obligatorias para el MVP inicial:

- Guardar simulaciones.
- Comparar escenarios.
- Exportar reporte PDF.
- Manejo avanzado de peso.
- Restricciones por centro de gravedad.
- Restricciones por familias de productos.
- Optimización avanzada.
- Autenticación de usuarios.
- Dashboard histórico.

---

## 5. Stack tecnológico recomendado

### Frontend

Usar:

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Three Fiber
- Three.js

Responsabilidades del frontend:

- Formularios para ingresar contenedores.
- Formularios para ingresar productos.
- Enviar datos al backend.
- Mostrar resultados de simulación.
- Renderizar escena 3D.
- Mostrar métricas.
- Mostrar listas de productos cargados y no cargados.

El frontend no debe contener la lógica principal del algoritmo de packing.
La lógica de optimización debe estar en el backend.

---

### Backend

Usar:

- FastAPI
- Python
- Pydantic

Responsabilidades del backend:

- Recibir datos desde el frontend.
- Validar contenedores y productos.
- Ejecutar el algoritmo de carga.
- Calcular posiciones de productos.
- Calcular porcentaje de ocupación.
- Determinar productos cargados y no cargados.
- Devolver una respuesta estructurada al frontend.

---

### Base de datos

Usar más adelante:

- PostgreSQL
- Supabase

La base de datos no es obligatoria para la primera versión funcional del MVP.

Primero se debe lograr este flujo:

Usuario → Frontend → Backend → Algoritmo → Respuesta → Visualización 3D

Luego se puede agregar persistencia.

Tablas futuras sugeridas:

- containers
- products
- simulations
- placements
- users

---

## 6. Arquitectura general

La arquitectura debe mantenerse simple, ordenada y escalable.

```txt
Usuario
  ↓
Frontend Next.js
  ↓
API Backend FastAPI
  ↓
Servicio de simulación
  ↓
Algoritmo 3D Bin Packing
  ↓
Respuesta JSON
  ↓
Visualización 3D en React Three Fiber
```
