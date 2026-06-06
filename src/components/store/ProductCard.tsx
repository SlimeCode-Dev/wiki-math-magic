import { Product, formatPrice, PLACEHOLDER_IMAGE } from "@/contexts/StoreContext";

export default function ProductCard({
  product,
  onView,
}: {
  product: Product;
  onView: (product: Product) => void;
}) {
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : 0;

  return (
    <div className="slime-card group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(57,255,20,0.18)]">
      <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
        <img
          src={product.image || PLACEHOLDER_IMAGE}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE;
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full border border-[#39ff14]/40 bg-black/70 px-3 py-1 text-[10px] font-semibold slime-neon backdrop-blur">
          {product.category}
        </span>
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-[#ff5722] px-2.5 py-1 text-[10px] font-bold text-white shadow-[0_0_14px_rgba(255,87,34,0.5)]">
            -{discount}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-bold text-white">
          {product.name}
        </h3>

        {/* Variant hints */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {product.sizes && product.sizes.length > 0 && (
            <span className="text-[11px] text-white/50">
              {product.sizes.join(" · ")}
            </span>
          )}
          {product.colors && product.colors.length > 0 && (
            <span className="flex items-center gap-1">
              {product.colors.slice(0, 4).map((c) => (
                <span
                  key={c.name}
                  title={c.name}
                  className="h-3.5 w-3.5 rounded-full border border-white/30"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-end gap-2">
          <p className="text-xl font-extrabold slime-neon">
            {formatPrice(product.price)}
          </p>
          {discount > 0 && (
            <p className="mb-0.5 text-xs text-white/40 line-through">
              {formatPrice(product.oldPrice!)}
            </p>
          )}
        </div>

        <button
          onClick={() => onView(product)}
          className="mt-4 w-full rounded-xl border border-[#39ff14] px-4 py-2.5 text-sm font-bold text-[#39ff14] transition-all hover:bg-[#39ff14]/10 hover:shadow-[0_0_18px_rgba(57,255,20,0.45)]"
        >
          Ver Detalhes
        </button>
      </div>
    </div>
  );
}
