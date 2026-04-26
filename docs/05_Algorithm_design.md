# Diseno del algoritmo MVP

Version inicial:

- Heuristica greedy 3D.
- No busca optimizacion global perfecta.
- Prioriza resultado rapido, visual y explicable.

## Criterios

1. Expandir productos por cantidad.
2. Ordenar productos por volumen descendente.
3. Cargar productos no fragiles antes que fragiles.
4. Probar rotaciones permitidas.
5. Ubicar cada producto en el primer espacio libre compatible.
6. Validar colisiones.
7. Respetar limite de peso del contenedor cuando exista.
8. Evitar apilar sobre productos fragiles o no apilables.
9. Actualizar espacios disponibles.
10. Calcular porcentaje de ocupacion.

## Limitaciones aceptadas para MVP

- No garantiza una solucion optima global.
- El soporte de apilado es conservador: una caja superior debe quedar cubierta por una caja inferior apilable.
- No calcula centro de gravedad.
- No maneja distribucion avanzada de peso.
- No agrupa familias de productos.

Estas limitaciones son aceptables para validar el flujo completo antes de optimizar.
