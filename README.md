# Container Optimizer 3D

Aplicacion web para simular la carga de productos dentro de un contenedor y visualizar el resultado en 3D.

El proyecto esta orientado a planificacion logistica de importaciones. El MVP prioriza una simulacion funcional, visual y clara antes que una optimizacion matematica perfecta.

```txt
Usuario -> Frontend Next.js -> Backend FastAPI -> Algoritmo greedy 3D -> JSON -> Visualizacion 3D
```

## Como correr la aplicacion

La aplicacion necesita dos procesos corriendo al mismo tiempo:

- Backend FastAPI en `http://localhost:8000`.
- Frontend Next.js en `http://localhost:3000`.

### Primera vez

Desde la carpeta raiz del proyecto, instalar dependencias del backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
```

Instalar dependencias del frontend:

```powershell
cd frontend
npm install
cd ..
```

### Levantar la app

Abrir una terminal para el backend:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

Abrir otra terminal para el frontend:

```powershell
cd frontend
npm run dev
```

Luego abrir:

```txt
http://localhost:3000
```

La documentacion interactiva de la API queda disponible en:

```txt
http://localhost:8000/docs
```

Para detener la aplicacion, presionar `Ctrl + C` en cada terminal.

## Estado actual

Disponible:

- Backend FastAPI con `GET /health` y `POST /simulate`.
- Modelos Pydantic para contenedor, productos, posiciones, metricas y productos no cargados.
- Algoritmo greedy 3D inicial.
- Frontend Next.js con formulario editable, metricas y escena 3D.
- Tests unitarios del algoritmo.

Pendiente para etapas posteriores:

- Persistencia en Supabase/PostgreSQL.
- Autenticacion.
- Exportacion PDF.
- Comparacion de escenarios.
- Reglas avanzadas de peso, centro de gravedad y familias de productos.

## Estructura

- `frontend/`: aplicacion Next.js con React, TypeScript, Tailwind CSS y React Three Fiber.
- `backend/`: API FastAPI con modelos Pydantic y algoritmo de packing MVP.
- `docs/`: documentacion tecnica del proyecto.
- `PROJECT_CONTEXT.md`: contexto principal del producto.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.
- Python 3.12 o superior.
- PowerShell en Windows para los comandos de ejemplo.

## API

- `GET /health`
- `POST /simulate`

Payload minimo:

```json
{
  "container": {
    "width": 235,
    "height": 239,
    "depth": 589,
    "max_weight": 24000
  },
  "products": [
    {
      "name": "Alfombra enrollada",
      "width": 40,
      "height": 40,
      "depth": 180,
      "weight": 18,
      "quantity": 8,
      "fragile": false,
      "stackable": true,
      "allow_rotations": true
    }
  ]
}
```

La respuesta incluye:

- `placements`: productos cargados con posicion `x`, `y`, `z` y dimensiones finales.
- `unloaded`: productos que no pudieron cargarse y motivo.
- `metrics`: volumen total, volumen cargado, porcentaje de ocupacion, peso cargado y conteos.

## Pruebas

Backend:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pytest
```

Frontend:

```powershell
cd frontend
npm run typecheck
npm run build
```

## Alcance MVP

Incluye:

- Configuracion de dimensiones del contenedor.
- Carga de productos con cantidad, peso, fragilidad, apilabilidad y rotaciones.
- Simulacion con heuristica greedy 3D.
- Productos cargados y no cargados.
- Porcentaje de ocupacion.
- Visualizacion 3D del contenedor.

Reglas actuales del algoritmo:

- Expande productos segun `quantity`.
- Ordena por volumen descendente.
- Prueba rotaciones cuando `allow_rotations` es `true`.
- Respeta `max_weight` cuando se define en el contenedor.
- No apila sobre productos fragiles o no apilables.
- Marca productos como no cargados cuando no encuentra espacio o exceden el peso.

No incluye aun:

- Base de datos.
- Autenticacion.
- Exportacion PDF.
- Optimizacion matematica avanzada.
- Comparacion historica de escenarios.

## Convenciones

- El backend es la fuente de verdad del algoritmo de packing.
- El frontend solo captura datos, llama a la API y visualiza resultados.
- Mantener cambios pequenos y verificables.
- Priorizar casos reales de uso antes que optimizaciones generales.

## Troubleshooting

Si el frontend no puede simular, verificar que el backend este corriendo en `http://localhost:8000`.

Si el puerto esta ocupado en Windows:

```powershell
Get-NetTCPConnection -LocalPort 8000
Get-NetTCPConnection -LocalPort 3000
```

Si se cambian dependencias del frontend:

```powershell
cd frontend
npm install
npm run build
```

Si se cambia el algoritmo:

```powershell
cd backend
pytest
```

## Proximos pasos recomendados

1. Agregar presets de contenedor: 20 pies, 40 pies y 40 HC.
2. Agregar tests de integracion para `POST /simulate`.
3. Mostrar tabla de posiciones exportable en el frontend.
4. Agregar validaciones UX para dimensiones y cantidades.
5. Guardar simulaciones solo despues de estabilizar el flujo actual.
