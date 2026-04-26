"use client";

import { Plus, Play, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { CargoScene } from "@/components/CargoScene";
import { runSimulation } from "@/lib/api";
import type { ContainerInput, ProductInput, SimulationResponse } from "@/types/simulation";

type ProductForm = ProductInput & {
  localId: string;
};

const defaultContainer: ContainerInput = {
  width: 235,
  height: 239,
  depth: 589,
  max_weight: 24000,
};

const defaultProducts: ProductForm[] = [
  {
    localId: "alfombra",
    name: "Alfombra enrollada",
    width: 40,
    height: 40,
    depth: 180,
    weight: 18,
    quantity: 8,
    fragile: false,
    stackable: true,
    allow_rotations: true,
  },
  {
    localId: "mesa",
    name: "Mesa auxiliar",
    width: 80,
    height: 55,
    depth: 80,
    weight: 22,
    quantity: 4,
    fragile: false,
    stackable: false,
    allow_rotations: true,
  },
  {
    localId: "ceramica",
    name: "Adorno ceramica",
    width: 35,
    height: 35,
    depth: 45,
    weight: 6,
    quantity: 12,
    fragile: true,
    stackable: false,
    allow_rotations: true,
  },
];

export default function Home() {
  const [container, setContainer] = useState<ContainerInput>(defaultContainer);
  const [products, setProducts] = useState<ProductForm[]>(defaultProducts);
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groupedLoaded = useMemo(() => {
    if (!result) return [];
    const totals = new Map<string, { name: string; count: number }>();
    for (const placement of result.placements) {
      const current = totals.get(placement.product_id) ?? { name: placement.product_name, count: 0 };
      current.count += 1;
      totals.set(placement.product_id, current);
    }
    return Array.from(totals.values());
  }, [result]);

  async function handleRunSimulation() {
    setIsLoading(true);
    setError(null);

    try {
      const payloadProducts = products.map(({ localId: _localId, ...product }) => product);
      const response = await runSimulation({
        container,
        products: payloadProducts,
      });
      setResult(response);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Error inesperado al simular.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateContainer(field: keyof ContainerInput, value: number) {
    setContainer((current) => ({
      ...current,
      [field]: Number.isFinite(value) && value > 0 ? value : 0,
    }));
  }

  function updateProduct(localId: string, patch: Partial<ProductForm>) {
    setProducts((current) =>
      current.map((product) => (product.localId === localId ? { ...product, ...patch } : product)),
    );
  }

  function addProduct() {
    setProducts((current) => [
      ...current,
      {
        localId: crypto.randomUUID(),
        name: "Nuevo producto",
        width: 50,
        height: 50,
        depth: 50,
        weight: 10,
        quantity: 1,
        fragile: false,
        stackable: true,
        allow_rotations: true,
      },
    ]);
  }

  function removeProduct(localId: string) {
    setProducts((current) => current.filter((product) => product.localId !== localId));
  }

  const sceneContainer = result?.container ?? container;
  const placements = result?.placements ?? [];
  const metrics = result?.metrics;

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-[1560px] flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-normal">Container Optimizer 3D</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Simulador MVP de carga con packing greedy 3D.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setContainer(defaultContainer);
                setProducts(defaultProducts);
                setResult(null);
                setError(null);
              }}
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-sm font-semibold text-[#26312b]"
              title="Restaurar datos de ejemplo"
            >
              <RotateCcw size={16} aria-hidden="true" />
              Ejemplo
            </button>
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isLoading || products.length === 0}
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[var(--accent)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              title="Ejecutar simulacion"
            >
              <Play size={16} aria-hidden="true" />
              {isLoading ? "Simulando" : "Simular"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1560px] gap-4 px-4 py-4 lg:grid-cols-[430px_1fr]">
        <section className="space-y-4">
          <div className="border border-[var(--line)] bg-[var(--panel)] p-4">
            <h2 className="text-base font-semibold">Contenedor</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <NumberField label="Ancho cm" value={container.width} onChange={(value) => updateContainer("width", value)} />
              <NumberField label="Alto cm" value={container.height} onChange={(value) => updateContainer("height", value)} />
              <NumberField label="Prof. cm" value={container.depth} onChange={(value) => updateContainer("depth", value)} />
              <NumberField
                label="Max kg"
                value={container.max_weight ?? 0}
                onChange={(value) => updateContainer("max_weight", value)}
              />
            </div>
          </div>

          <div className="border border-[var(--line)] bg-[var(--panel)] p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Productos</h2>
              <button
                type="button"
                onClick={addProduct}
                className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-sm font-semibold"
                title="Agregar producto"
              >
                <Plus size={16} aria-hidden="true" />
                Agregar
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {products.map((product) => (
                <div key={product.localId} className="border-t border-[var(--line)] pt-4 first:border-t-0 first:pt-0">
                  <div className="flex items-center gap-2">
                    <input
                      className="input"
                      value={product.name}
                      onChange={(event) => updateProduct(product.localId, { name: event.target.value })}
                      aria-label="Nombre del producto"
                    />
                    <button
                      type="button"
                      onClick={() => removeProduct(product.localId)}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--line)] bg-white text-[#9f1239]"
                      title="Eliminar producto"
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <NumberField
                      label="Ancho"
                      value={product.width}
                      onChange={(value) => updateProduct(product.localId, { width: value })}
                    />
                    <NumberField
                      label="Alto"
                      value={product.height}
                      onChange={(value) => updateProduct(product.localId, { height: value })}
                    />
                    <NumberField
                      label="Prof."
                      value={product.depth}
                      onChange={(value) => updateProduct(product.localId, { depth: value })}
                    />
                    <NumberField
                      label="Kg"
                      value={product.weight}
                      onChange={(value) => updateProduct(product.localId, { weight: value })}
                    />
                    <NumberField
                      label="Cant."
                      value={product.quantity}
                      onChange={(value) => updateProduct(product.localId, { quantity: Math.max(1, Math.round(value)) })}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={product.fragile}
                        onChange={(event) => updateProduct(product.localId, { fragile: event.target.checked })}
                      />
                      Fragil
                    </label>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={product.stackable}
                        onChange={(event) => updateProduct(product.localId, { stackable: event.target.checked })}
                      />
                      Apilable
                    </label>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={product.allow_rotations}
                        onChange={(event) => updateProduct(product.localId, { allow_rotations: event.target.checked })}
                      />
                      Rotar
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {error ? (
            <div className="border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-sm text-[#9f1239]">{error}</div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-4">
            <Metric label="Ocupacion" value={metrics ? `${metrics.occupancy_percentage}%` : "0%"} />
            <Metric label="Cargados" value={metrics ? String(metrics.loaded_items) : "0"} />
            <Metric label="No cargados" value={metrics ? String(metrics.unloaded_items) : "0"} />
            <Metric label="Peso" value={metrics ? `${metrics.loaded_weight} kg` : "0 kg"} />
          </div>

          <CargoScene container={sceneContainer} placements={placements} />

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="border border-[var(--line)] bg-[var(--panel)] p-4">
              <h2 className="text-base font-semibold">Productos cargados</h2>
              <div className="mt-3 space-y-2 text-sm">
                {groupedLoaded.length ? (
                  groupedLoaded.map((item) => (
                    <div key={item.name} className="flex items-center justify-between border-b border-[var(--line)] py-2 last:border-b-0">
                      <span>{item.name}</span>
                      <strong>{item.count}</strong>
                    </div>
                  ))
                ) : (
                  <p className="text-[var(--muted)]">Ejecuta una simulacion para ver resultados.</p>
                )}
              </div>
            </div>

            <div className="border border-[var(--line)] bg-[var(--panel)] p-4">
              <h2 className="text-base font-semibold">Productos no cargados</h2>
              <div className="mt-3 max-h-56 space-y-2 overflow-auto text-sm">
                {result?.unloaded.length ? (
                  result.unloaded.map((item) => (
                    <div key={item.item_id} className="border-b border-[var(--line)] py-2 last:border-b-0">
                      <div className="flex items-center justify-between gap-3">
                        <span>{item.product_name}</span>
                        <strong>{reasonLabel(item.reason)}</strong>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[var(--muted)]">Sin productos pendientes.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input className="input" type="number" min={0} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--line)] bg-[var(--panel)] p-4">
      <div className="text-xs font-bold uppercase text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function reasonLabel(reason: string) {
  const labels: Record<string, string> = {
    no_available_space: "Sin espacio",
    weight_limit_exceeded: "Peso max.",
  };

  return labels[reason] ?? reason;
}
