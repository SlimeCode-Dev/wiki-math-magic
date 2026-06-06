import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ProductCategory =
  | "Camisas Personalizadas"
  | "Mochilas"
  | "Mouse Pads"
  | "PCs Montados";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Camisas Personalizadas",
  "Mochilas",
  "Mouse Pads",
  "PCs Montados",
];

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  oldPrice?: number;
  image: string;
  shopeeLink: string;
  whatsappLink?: string;
  description: string;
  sizes?: string[];
  colors?: ProductColor[];
  stock?: number;
  highlights?: string[];
  featured?: boolean;
}

const STORAGE_KEY = "slime_store_products";

const generateId = () => Math.random().toString(36).substring(2, 9);

const PLACEHOLDER =
  "https://placehold.co/600x600/1a1a1a/39ff14?text=Slime+Code";

const defaultProducts: Product[] = [
  {
    id: "prod-1",
    name: "Camisa Gamer Slime Code Neon",
    category: "Camisas Personalizadas",
    price: 89.9,
    oldPrice: 119.9,
    image: "https://placehold.co/600x600/1a1a1a/39ff14?text=Camisa+Gamer",
    shopeeLink: "https://shopee.com.br",
    description:
      "Camisa 100% algodão com estampa exclusiva Slime Code em verde neon. Tecido premium, confortável e ideal para o dia a dia gamer. Disponível em vários tamanhos e cores.",
    sizes: ["P", "M", "G", "GG"],
    colors: [
      { name: "Preto", hex: "#0a0a0a" },
      { name: "Verde Neon", hex: "#39ff14" },
      { name: "Cinza Chumbo", hex: "#3a3a3a" },
      { name: "Branco", hex: "#f5f5f5" },
    ],
    stock: 42,
    highlights: ["100% algodão", "Estampa exclusiva", "Modelagem unissex"],
    featured: true,
  },
  {
    id: "prod-2",
    name: "Mochila Tech Anti-Furto",
    category: "Mochilas",
    price: 249.9,
    oldPrice: 299.9,
    image: "https://placehold.co/600x600/1a1a1a/39ff14?text=Mochila+Tech",
    shopeeLink: "https://shopee.com.br",
    description:
      "Mochila resistente à água com compartimento acolchoado para notebook até 17\", porta USB externa e fecho anti-furto. Perfeita para levar seu setup com estilo.",
    colors: [
      { name: "Preto", hex: "#0a0a0a" },
      { name: "Grafite", hex: "#2c2c2c" },
    ],
    stock: 18,
    highlights: ["Impermeável", "Porta USB", "Compartimento p/ notebook 17\""],
    featured: true,
  },
  {
    id: "prod-3",
    name: "Mouse Pad Speed XL RGB",
    category: "Mouse Pads",
    price: 119.9,
    image: "https://placehold.co/600x600/1a1a1a/39ff14?text=Mouse+Pad+RGB",
    shopeeLink: "https://shopee.com.br",
    description:
      "Mouse pad gamer estendido (90x40cm) com iluminação RGB nas bordas, base antiderrapante e superfície de alta precisão para máxima performance nos games.",
    sizes: ["Médio (45x40)", "Grande (90x40)"],
    colors: [
      { name: "Preto RGB", hex: "#0a0a0a" },
      { name: "Verde Neon", hex: "#39ff14" },
    ],
    stock: 60,
    highlights: ["Iluminação RGB", "Base antiderrapante", "Costura reforçada"],
  },
  {
    id: "prod-4",
    name: "PC Gamer Slime Ultra RTX",
    category: "PCs Montados",
    price: 6499.0,
    oldPrice: 7299.0,
    image: "https://placehold.co/600x600/1a1a1a/39ff14?text=PC+Gamer",
    shopeeLink: "https://shopee.com.br",
    description:
      "PC Gamer completo: Ryzen 7, 32GB RAM, SSD 1TB NVMe, placa de vídeo RTX dedicada e gabinete com iluminação RGB. Montado e testado pela equipe Slime Code.",
    highlights: ["Ryzen 7", "32GB RAM", "SSD 1TB NVMe", "RTX dedicada"],
    stock: 5,
    featured: true,
  },
];

interface StoreContextType {
  products: Product[];
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(defaultProducts);

  useEffect(() => {
    const VERSION_KEY = "slime_store_version";
    const CURRENT_VERSION = "2";
    const storedVersion = localStorage.getItem(VERSION_KEY);

    if (storedVersion !== CURRENT_VERSION) {
      // New product fields added — refresh with enriched defaults
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      setProducts(defaultProducts);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) setProducts(parsed);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const persist = (next: Product[]) => {
    setProducts(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addProduct = (p: Omit<Product, "id">) =>
    persist([{ ...p, id: generateId() }, ...products]);

  const updateProduct = (id: string, p: Partial<Product>) =>
    persist(products.map((prod) => (prod.id === id ? { ...prod, ...p } : prod)));

  const deleteProduct = (id: string) =>
    persist(products.filter((prod) => prod.id !== id));

  const resetProducts = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProducts(defaultProducts);
  };

  return (
    <StoreContext.Provider
      value={{ products, addProduct, updateProduct, deleteProduct, resetProducts }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export const PLACEHOLDER_IMAGE = PLACEHOLDER;

export const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
