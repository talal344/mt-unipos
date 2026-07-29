"use client";

import React, { use, useState, useMemo } from "react";
import { useGlobalContext, Product, ProductVariant, ProductAddon } from "@/context/global-context";
import { ShoppingCart, Plus, Minus, X, CheckCircle2, ChevronRight, UtensilsCrossed, AlertCircle } from "lucide-react";

interface CartItem {
  id: string;
  product: Product;
  qty: number;
  selectedVariant?: ProductVariant;
  selectedAddons: ProductAddon[];
  notes?: string;
  totalPrice: number;
}

export default function QRMenuPage({ params }: { params: Promise<{ tenantId: string; tableId: string }> }) {
  const { tenantId, tableId } = use(params);
  const { products, dispatchKitchenTicket, currencySymbol } = useGlobalContext();

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  
  // Customization modal state
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);
  const [itemQty, setItemQty] = useState(1);
  const [itemNotes, setItemNotes] = useState("");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ["All", ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  const cartTotalQty = cart.reduce((acc, item) => acc + item.qty, 0);
  const cartTotalPrice = cart.reduce((acc, item) => acc + item.totalPrice, 0);

  const openCustomize = (product: Product) => {
    setCustomizingProduct(product);
    setSelectedVariant(product.variants?.[0] || null);
    setSelectedAddons([]);
    setItemQty(1);
    setItemNotes("");
  };

  const closeCustomize = () => {
    setCustomizingProduct(null);
  };

  const toggleAddon = (addon: ProductAddon) => {
    if (selectedAddons.find(a => a.name === addon.name)) {
      setSelectedAddons(prev => prev.filter(a => a.name !== addon.name));
    } else {
      setSelectedAddons(prev => [...prev, addon]);
    }
  };

  const addToCart = () => {
    if (!customizingProduct) return;
    
    let basePrice = customizingProduct.salePrice;
    if (selectedVariant) {
      basePrice = selectedVariant.price;
    }
    const addonsPrice = selectedAddons.reduce((acc, a) => acc + a.price, 0);
    const unitPrice = basePrice + addonsPrice;
    const totalPrice = unitPrice * itemQty;

    const newItem: CartItem = {
      id: Math.random().toString(36).substring(7),
      product: customizingProduct,
      qty: itemQty,
      selectedVariant: selectedVariant || undefined,
      selectedAddons: selectedAddons,
      notes: itemNotes,
      totalPrice
    };

    setCart(prev => [...prev, newItem]);
    closeCustomize();
  };

  const addDirectlyToCart = (product: Product) => {
    const newItem: CartItem = {
      id: Math.random().toString(36).substring(7),
      product: product,
      qty: 1,
      selectedAddons: [],
      totalPrice: product.salePrice
    };
    setCart(prev => [...prev, newItem]);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        const unitPrice = item.totalPrice / item.qty;
        return { ...item, qty: newQty, totalPrice: unitPrice * newQty };
      }
      return item;
    }));
  };

  const sendOrderToKitchen = () => {
    const itemsForKitchen = cart.map(item => {
      const variantText = item.selectedVariant ? ` (${item.selectedVariant.name})` : "";
      const addonText = item.selectedAddons.length > 0 ? `\nAddons: ${item.selectedAddons.map(a => a.name).join(', ')}` : "";
      const notesText = item.notes ? `\nNotes: ${item.notes}` : "";
      return {
        name: `${item.product.name}${variantText}`,
        qty: item.qty,
        notes: `${addonText}${notesText}`.trim()
      };
    });

    dispatchKitchenTicket(tableId, itemsForKitchen);
    setCart([]);
    setIsCartOpen(false);
    setIsSuccessOpen(true);
  };

  if (isSuccessOpen) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-bold mb-3 tracking-tight">Order Received!</h1>
        <p className="text-slate-400 mb-8 max-w-sm">
          Your order has been sent to the kitchen. We'll bring it out to Table {tableId} shortly!
        </p>
        <button 
          onClick={() => setIsSuccessOpen(false)}
          className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-8 py-3 rounded-full font-medium transition-all"
        >
          Order More
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 selection:bg-fuchsia-500/30">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 pt-6 pb-4 px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-fuchsia-400 text-xs font-semibold uppercase tracking-wider mb-1">Welcome to</p>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Our Menu
            </h1>
          </div>
          <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
            <UtensilsCrossed size={14} className="text-slate-400" />
            <span className="text-sm font-medium">Table {tableId}</span>
          </div>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat 
                  ? "bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/25" 
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center">
            <AlertCircle className="text-slate-500 mb-3" size={32} />
            <p className="text-slate-400">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map(product => {
              const hasOptions = (product.variants && product.variants.length > 0) || (product.addons && product.addons.length > 0);
              
              return (
                <div key={product.id} className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col h-full backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 blur-2xl -z-10 group-hover:from-violet-500/20 group-hover:to-fuchsia-500/20 transition-all"></div>
                  
                  {product.image ? (
                    <div className="w-full aspect-square bg-slate-900 rounded-xl mb-3 overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-80" />
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-slate-800/50 rounded-xl mb-3 flex items-center justify-center border border-white/5">
                      <UtensilsCrossed className="text-slate-600" size={32} />
                    </div>
                  )}
                  
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-slate-200 leading-tight mb-1">{product.name}</h3>
                    <p className="text-fuchsia-400 font-medium text-sm mt-auto mb-3">
                      {currencySymbol}{product.salePrice.toFixed(2)}
                    </p>
                    
                    {hasOptions ? (
                      <button 
                        onClick={() => openCustomize(product)}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        Customize
                      </button>
                    ) : (
                      <button 
                        onClick={() => addDirectlyToCart(product)}
                        className="w-full py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-fuchsia-500/20"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart FAB */}
      {cartTotalQty > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-4 right-4 z-40">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-slate-800 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-2xl shadow-black/50"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 w-10 h-10 rounded-full flex items-center justify-center text-white relative">
                <ShoppingCart size={18} />
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartTotalQty}
                </span>
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-medium">View your order</p>
                <p className="text-white font-bold">{currencySymbol}{cartTotalPrice.toFixed(2)}</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white">
              <ChevronRight size={20} />
            </div>
          </button>
        </div>
      )}

      {/* Customization Bottom Sheet Modal */}
      {customizingProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-slate-900 rounded-t-3xl sm:rounded-t-3xl z-10">
              <h2 className="text-lg font-bold text-white">Customize Item</h2>
              <button onClick={closeCustomize} className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto hide-scrollbar flex-1">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{customizingProduct.name}</h3>
                  <p className="text-fuchsia-400 font-medium text-lg">
                    {currencySymbol}
                    {(
                      (selectedVariant ? selectedVariant.price : customizingProduct.salePrice) + 
                      selectedAddons.reduce((a, b) => a + b.price, 0)
                    ).toFixed(2)}
                  </p>
                </div>
              </div>

              {customizingProduct.variants && customizingProduct.variants.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Size / Option</h4>
                  <div className="space-y-2">
                    {customizingProduct.variants.map(variant => (
                      <div 
                        key={variant.name} 
                        onClick={() => setSelectedVariant(variant)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedVariant?.name === variant.name 
                            ? "bg-fuchsia-500/10 border-fuchsia-500/50" 
                            : "bg-white/5 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            selectedVariant?.name === variant.name ? "border-fuchsia-500" : "border-slate-600"
                          }`}>
                            {selectedVariant?.name === variant.name && <div className="w-2.5 h-2.5 bg-fuchsia-500 rounded-full" />}
                          </div>
                          <span className="text-slate-200 font-medium">{variant.name}</span>
                        </div>
                        <span className="text-slate-300">{currencySymbol}{variant.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {customizingProduct.addons && customizingProduct.addons.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Extras</h4>
                  <div className="space-y-2">
                    {customizingProduct.addons.map(addon => {
                      const isSelected = selectedAddons.some(a => a.name === addon.name);
                      return (
                        <div 
                          key={addon.name} 
                          onClick={() => toggleAddon(addon)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected 
                              ? "bg-violet-500/10 border-violet-500/50" 
                              : "bg-white/5 border-white/5 hover:border-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                              isSelected ? "bg-violet-500 border-violet-500 text-white" : "border-slate-600"
                            }`}>
                              {isSelected && <CheckCircle2 size={14} />}
                            </div>
                            <span className="text-slate-200 font-medium">{addon.name}</span>
                          </div>
                          <span className="text-slate-300">+{currencySymbol}{addon.price.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Special Instructions</h4>
                <textarea 
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="Any special requests?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 resize-none h-24"
                />
              </div>

              <div className="flex items-center justify-center gap-6 py-4">
                <button 
                  onClick={() => setItemQty(Math.max(1, itemQty - 1))}
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-95 transition-all"
                >
                  <Minus size={20} />
                </button>
                <span className="text-2xl font-bold w-8 text-center text-white">{itemQty}</span>
                <button 
                  onClick={() => setItemQty(itemQty + 1)}
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-95 transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-slate-900 sm:rounded-b-3xl">
              <button 
                onClick={addToCart}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-fuchsia-500/20 active:scale-[0.98] transition-all"
              >
                Add to Order - {currencySymbol}
                {(
                  ((selectedVariant ? selectedVariant.price : customizingProduct.salePrice) + 
                  selectedAddons.reduce((a, b) => a + b.price, 0)) * itemQty
                ).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Cart */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <header className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingCart size={20} className="text-fuchsia-400" />
              Your Order
            </h2>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-300 transition-colors"
            >
              <X size={20} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex gap-4 relative overflow-hidden">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-lg text-white leading-tight pr-4">{item.product.name}</h3>
                    <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-rose-400 absolute top-4 right-4">
                      <X size={18} />
                    </button>
                  </div>
                  
                  {item.selectedVariant && (
                    <p className="text-sm text-slate-400">Size: {item.selectedVariant.name}</p>
                  )}
                  {item.selectedAddons.length > 0 && (
                    <p className="text-sm text-slate-400">
                      + {item.selectedAddons.map(a => a.name).join(', ')}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-sm text-amber-400/80 italic mt-1 text-xs bg-amber-400/10 inline-block px-2 py-0.5 rounded">
                      Note: {item.notes}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 bg-black/40 rounded-full p-1 border border-white/5">
                      <button onClick={() => updateCartQty(item.id, -1)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="font-medium text-sm w-4 text-center text-white">{item.qty}</span>
                      <button onClick={() => updateCartQty(item.id, 1)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="font-bold text-fuchsia-400">{currencySymbol}{item.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {cart.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShoppingCart className="text-slate-600 mb-4" size={48} />
                <h3 className="text-xl font-medium text-slate-300 mb-2">Your cart is empty</h3>
                <p className="text-slate-500 mb-6">Add some delicious items from our menu to get started.</p>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors"
                >
                  Browse Menu
                </button>
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-4 border-t border-white/10 bg-slate-900/90 backdrop-blur-xl">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-slate-400 text-sm">
                  <span>Subtotal</span>
                  <span>{currencySymbol}{cartTotalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span>{currencySymbol}{cartTotalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                onClick={sendOrderToKitchen}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(217,70,239,0.3)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <UtensilsCrossed size={20} />
                Send Order to Kitchen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
