import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowLeft, ShieldCheck, Store as StoreIcon, Sparkles } from "lucide-react";
import { useLMS } from "@/contexts/LMSContext";
import { useStore, PRODUCT_CATEGORIES, Product } from "@/contexts/StoreContext";
import { T } from "@/components/landing/Editable";
import ProductCard from "@/components/store/ProductCard";
import ProductDetailsModal from "@/components/store/ProductDetailsModal";
import AdminStorePanel from "@/components/store/AdminStorePanel";

const PILLS = ["Todos", ...PRODUCT_CATEGORIES] as const;

export default function Loja() {
  const { currentUser } = useLMS();
  const { products } = useStore();
  const isAdmin = currentUser?.role === "admin";

  const [activeCat, setActiveCat] = useState<string>("Todos");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [adminMode, setAdminMode] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = activeCat === "Todos" || p.category === activeCat;
      const matchQuery = p.name.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [products, activeCat, query]);

  return (
    <div className="slime-scanlines slime-font min-h-screen text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#3ddc84]/20 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#3ddc84] font-extrabold text-black">
              S
            </span>
            <span className="hidden text-lg font-extrabold tracking-wide sm:inline">
              SLIME <span className="slime-neon">CODE</span>
            </span>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-[#3ddc84]"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>
        </div>
      </header>

      {/* Banner */}
      <section className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-[#3ddc84]/30 bg-gradient-to-br from-[#0d1a0d] via-[#0a0a0a] to-[#0a0a0a] p-8 md:p-12">
          {/* Glow blobs */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#3ddc84]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-[#3ddc84]/10 blur-3xl" />
          {/* Grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(#3ddc84 1px, transparent 1px), linear-gradient(90deg, #3ddc84 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#3ddc84]/50 bg-black/40 px-4 py-1.5 text-xs font-semibold slime-neon backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> <T id="loja.banner.badge">COLEÇÃO GAMER & TECH</T>
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-5xl slime-neon">
                <T id="loja.banner.title">LOJA SLIME CODE</T>
              </h1>
              <T as="p" className="mt-4 max-w-lg text-white/70" id="loja.banner.description" multiline>
                Camisas personalizadas, mochilas, mouse pads e PCs montados com a
                identidade neon da Slime Code. Estilo, performance e qualidade
                para o seu setup.
              </T>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#produtos"
                  className="slime-glow-btn inline-flex items-center gap-2 rounded-xl bg-[#3ddc84] px-6 py-3 font-bold text-black"
                >
                  <StoreIcon className="h-5 w-5" /> <T id="loja.banner.cta">Ver produtos</T>
                </a>
                {isAdmin && (
                  <button
                    onClick={() => setAdminMode((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#3ddc84] px-6 py-3 font-bold text-[#3ddc84] transition-all hover:bg-[#3ddc84]/10"
                  >
                    {adminMode ? (
                      <>
                        <StoreIcon className="h-5 w-5" /> Ver Vitrine
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-5 w-5" /> Admin Store
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 lg:gap-6">
              {[
                { value: "100%", label: "Tema Gamer" },
                { value: "Frete", label: "Para todo BR" },
                { value: "24h", label: "Atendimento" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-[#3ddc84]/20 bg-black/40 px-4 py-4 text-center backdrop-blur"
                >
                  <p className="text-xl font-extrabold slime-neon md:text-2xl">
                    {s.value}
                  </p>
                  <p className="mt-1 text-[11px] text-white/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {adminMode && isAdmin ? (
        <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <AdminStorePanel />
        </section>
      ) : (
        <>
          {/* Secondary header: search + pills */}
          <section id="produtos" className="mx-auto max-w-7xl px-4 pt-10 md:px-8">
            <div className="mb-5 flex items-center gap-3">
              <h2 className="text-2xl font-extrabold md:text-3xl">
                Nossos <span className="slime-neon">Produtos</span>
              </h2>
              <span className="h-px flex-1 bg-[#3ddc84]/20" />
            </div>
            <div className="relative mb-6 max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar produtos..."
                className="slime-input w-full rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {PILLS.map((pill) => {
                const active = activeCat === pill;
                return (
                  <button
                    key={pill}
                    onClick={() => setActiveCat(pill)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                      active
                        ? "border-[#3ddc84] bg-[#3ddc84] text-black shadow-[0_0_18px_rgba(61,220,132,0.4)]"
                        : "border-[#3ddc84]/30 text-white/70 hover:border-[#3ddc84] hover:text-[#3ddc84]"
                    }`}
                  >
                    {pill}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Product grid */}
          <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
            {filtered.length === 0 ? (
              <p className="py-20 text-center text-white/50">
                Nenhum produto encontrado.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} onView={setSelected} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <ProductDetailsModal product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
