import { useState } from "react";
import { Pencil, Trash2, Plus, Save, ImageIcon, X } from "lucide-react";
import {
  Product,
  ProductCategory,
  ProductColor,
  PRODUCT_CATEGORIES,
  formatPrice,
  PLACEHOLDER_IMAGE,
  useStore,
} from "@/contexts/StoreContext";

interface FormState {
  name: string;
  category: ProductCategory;
  price: string;
  oldPrice: string;
  image: string;
  shopeeLink: string;
  description: string;
  sizes: string;
  colors: string;
  stock: string;
  highlights: string;
}

const emptyForm: FormState = {
  name: "",
  category: "Camisas Personalizadas",
  price: "",
  oldPrice: "",
  image: "",
  shopeeLink: "",
  description: "",
  sizes: "",
  colors: "",
  stock: "",
  highlights: "",
};

// "Preto:#0a0a0a, Verde:#3ddc84" -> ProductColor[]
function parseColors(raw: string): ProductColor[] {
  return raw
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => {
      const [name, hex] = c.split(":").map((x) => x.trim());
      return { name: name || hex, hex: hex || "#3ddc84" };
    });
}

function colorsToString(colors?: ProductColor[]): string {
  return (colors || []).map((c) => `${c.name}:${c.hex}`).join(", ");
}

function splitList(raw: string): string[] {
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function AdminStorePanel() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : "",
      image: p.image,
      shopeeLink: p.shopeeLink,
      description: p.description,
      sizes: (p.sizes || []).join(", "),
      colors: colorsToString(p.colors),
      stock: typeof p.stock === "number" ? String(p.stock) : "",
      highlights: (p.highlights || []).join(", "),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: parseFloat(form.price) || 0,
      oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : undefined,
      image: form.image.trim(),
      shopeeLink: form.shopeeLink.trim(),
      description: form.description.trim(),
      sizes: splitList(form.sizes),
      colors: parseColors(form.colors),
      stock: form.stock ? parseInt(form.stock, 10) : undefined,
      highlights: splitList(form.highlights),
    };
    if (editingId) updateProduct(editingId, payload);
    else addProduct(payload);
    resetForm();
  };

  const inputCls =
    "slime-input w-full rounded-xl px-4 py-3 text-white placeholder:text-white/40";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="slime-card h-fit space-y-4 rounded-3xl p-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold slime-neon">
            {editingId ? "Editar Produto" : "Adicionar Produto"}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-1 text-xs text-white/50 hover:text-[#3ddc84]"
            >
              <X className="h-4 w-4" /> Cancelar
            </button>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-white/60">
            Nome do Produto
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Ex: Camisa Gamer Neon"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-white/60">
            Categoria
          </label>
          <select
            value={form.category}
            onChange={(e) => set({ category: e.target.value as ProductCategory })}
            className={inputCls}
          >
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-[#1a1a1a]">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/60">
              Preço (R$)
            </label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => set({ price: e.target.value })}
              placeholder="0.00"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/60">
              Preço antigo (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.oldPrice}
              onChange={(e) => set({ oldPrice: e.target.value })}
              placeholder="opcional"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-white/60">
            Estoque (quantidade)
          </label>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => set({ stock: e.target.value })}
            placeholder="opcional"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-white/60">
            URL da Imagem
          </label>
          <input
            value={form.image}
            onChange={(e) => set({ image: e.target.value })}
            placeholder="https://..."
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-white/60">
            Link do Produto na Shopee
          </label>
          <input
            value={form.shopeeLink}
            onChange={(e) => set({ shopeeLink: e.target.value })}
            placeholder="https://shopee.com.br/..."
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-white/60">
            Descrição do Produto
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="Detalhes do produto..."
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-white/60">
            Tamanhos (separados por vírgula)
          </label>
          <input
            value={form.sizes}
            onChange={(e) => set({ sizes: e.target.value })}
            placeholder="P, M, G, GG"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-white/60">
            Cores (nome:hex, separadas por vírgula)
          </label>
          <input
            value={form.colors}
            onChange={(e) => set({ colors: e.target.value })}
            placeholder="Preto:#0a0a0a, Verde Neon:#3ddc84"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-white/60">
            Destaques (separados por vírgula)
          </label>
          <input
            value={form.highlights}
            onChange={(e) => set({ highlights: e.target.value })}
            placeholder="100% algodão, Estampa exclusiva"
            className={inputCls}
          />
        </div>



        <button
          type="submit"
          className="slime-glow-btn flex w-full items-center justify-center gap-2 rounded-xl bg-[#3ddc84] px-6 py-3.5 font-bold text-black"
        >
          {editingId ? <Save className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          Salvar Produto
        </button>
      </form>

      {/* Table */}
      <div className="slime-card overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-white/50">
                <th className="px-4 py-3">Imagem</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-white/50">
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              )}
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-[#1a1a1a]">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              PLACEHOLDER_IMAGE;
                          }}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-white/30">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                  <td className="px-4 py-3 text-white/70">{p.category}</td>
                  <td className="px-4 py-3 font-bold slime-neon">
                    {formatPrice(p.price)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(p)}
                        aria-label="Editar"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-[#3ddc84]/40 text-[#3ddc84] transition-colors hover:bg-[#3ddc84]/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        aria-label="Excluir"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-red-500/40 text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
