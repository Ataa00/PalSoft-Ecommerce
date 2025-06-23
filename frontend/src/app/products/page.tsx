"use client";

import {
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import { ProductBasic } from "@/types/product";
import ProductService from "@/services/product.service";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useSearchParams, useRouter } from "next/navigation";
import { FaShoppingCart, FaFilter } from "react-icons/fa";
import gsap from "gsap";
import toast from "react-hot-toast";
import CartDrawer from "@/components/CartDrawer";
import ProductSearch, { SearchResultsSummary } from "@/components/products/ProductSearch";
import ProductFilters, { FilterState, MobileFilters } from "@/components/products/ProductFilters";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductBasic[]>([]);
  const [filtered, setFiltered] = useState<ProductBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // category and priceRange state removed as they're not used
  const { state, dispatch } = useCart();
  const [isCartOpen, setCartOpen] = useState(false);
  const [isMobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<ProductBasic[]>([]);

  const searchParams = useSearchParams();
  const search = searchParams.get("search")?.toLowerCase() || "";

  // Filter options
  const categories = [
    { value: "electronics", label: "Electronics", count: 12 },
    { value: "clothing", label: "Clothing", count: 25 },
    { value: "books", label: "Books", count: 8 },
    { value: "home", label: "Home & Garden", count: 15 },
    { value: "sports", label: "Sports", count: 10 }
  ];

  const priceRanges = [
    { value: "0-25", label: "Under $25", count: 15 },
    { value: "25-50", label: "$25 - $50", count: 20 },
    { value: "50-100", label: "$50 - $100", count: 18 },
    { value: "100-200", label: "$100 - $200", count: 12 },
    { value: "200+", label: "Over $200", count: 8 }
  ];

  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cartIconRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProducts = await ProductService.getAllProducts();
        setProducts(fetchedProducts);
        setFiltered(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle filters change
  const handleFiltersChange = (filters: FilterState) => {
    let result = [...products];

    // Apply search filter
    if (search) {
      result = result.filter(product =>
        product.title.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search)
      );
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter(product =>
        filters.categories.includes(product.category.toLowerCase())
      );
    }

    // Apply price range filter
    if (filters.priceRange.length > 0) {
      result = result.filter(product => {
        return filters.priceRange.some(range => {
          if (range === '200+') {
            return product.price >= 200;
          }
          const [min, max] = range.split('-').map(v => parseInt(v));
          return product.price >= min && product.price <= max;
        });
      });
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low-high':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rate - a.rate);
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      default:
        // Keep original order for relevance
        break;
    }

    setFilteredProducts(result);
    setFiltered(result); // Keep compatibility with existing code
  };

  const handleFilter = useCallback(() => {
    let result = products;

    if (search) {
      result = result.filter((p) => p.title.toLowerCase().includes(search));
    }

    // Category and price range filtering removed as state variables are not used

    setFiltered(result);
  }, [search, products]);

  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const targets = cardsRef.current.filter(Boolean);

      gsap.killTweensOf(targets);
      gsap.set(targets, { opacity: 1 });

      gsap.from(targets, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
        yoyo: true,
        stagger: {
          each: 0.02,
          from: "start",
        },
        clearProps: "transform",
      });
    });

    return () => ctx.revert();
  }, [filtered]);

  const animateToCart = (imgEl: HTMLImageElement | null) => {
    if (!imgEl || !cartIconRef.current) return;

    const cartRect = cartIconRef.current.getBoundingClientRect();
    const imgRect = imgEl.getBoundingClientRect();

    const clone = imgEl.cloneNode(true) as HTMLImageElement;
    clone.style.position = "fixed";
    clone.style.left = `${imgRect.left}px`;
    clone.style.top = `${imgRect.top}px`;
    clone.style.width = `${imgRect.width}px`;
    clone.style.height = `${imgRect.height}px`;
    clone.style.zIndex = "9999";
    clone.style.pointerEvents = "none";

    document.body.appendChild(clone);

    gsap.to(clone, {
      duration: 0.8,
      left: cartRect.left + cartRect.width / 2 - imgRect.width / 4,
      top: cartRect.top + cartRect.height / 2 - imgRect.height / 4,
      scale: 0.3,
      opacity: 0.5,
      ease: "power2.inOut",
      onComplete: () => {
        document.body.removeChild(clone);
      },
    });
  };

  useEffect(() => {
    const updatePosition = () => {
      const icon = cartIconRef.current;
      if (!icon) return;

      const scrollY = window.scrollY;
      icon.style.transform = `translateY(${scrollY}px)`;
    };

    window.addEventListener("scroll", updatePosition);
    updatePosition();
    return () => window.removeEventListener("scroll", updatePosition);
  }, []);

  // handleClear and uniqueCategories removed as they're not used
  const cartCount = state.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <ProductSearch className="max-w-2xl mx-auto" />
      </div>

      {/* Search Results Summary */}
      {search && (
        <SearchResultsSummary
          query={search}
          totalResults={filteredProducts.length}
          onClearSearch={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete('search');
            router.push(`/products?${params.toString()}`);
          }}
        />
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Desktop Filters */}
        <aside className="hidden lg:block lg:col-span-1">
          <ProductFilters
            categories={categories}
            priceRanges={priceRanges}
            onFiltersChange={handleFiltersChange}
          />
        </aside>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
          >
            <FaFilter className="text-sm" />
            <span>Filters</span>
          </button>
        </div>

        {/* Main Content */}
        <main className="lg:col-span-3">
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Home / Products
              <br />
              <span className="font-semibold">
                Showing {filteredProducts.length} of {products.length} results
              </span>
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className="bg-white shadow-md rounded-lg p-4 space-y-3
             transform transition-transform duration-500
             ease-[cubic-bezier(0.25,0.8,0.25,1)]
             hover:scale-105 hover:shadow-2xl origin-center"
            >
              <div className="relative w-full aspect-[3/4] rounded overflow-hidden bg-white">
                <Link
                  href={`/product/${product.id}`}
                  className="block w-full h-full"
                >
                  <Image
                    ref={(el) => void (imageRefs.current[index] = el)}
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-contain"
                  />
                </Link>
                {product.tag && (
                  <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                    {product.tag}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-semibold line-clamp-1">
                  {product.title}
                </h4>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {product.category} • {product.sizes.length} sizes available
                </p>
                <div className="flex items-center gap-1 text-yellow-500 text-lg">
                  {"★".repeat(Math.round(product.rate))}
                  {"☆".repeat(5 - Math.round(product.rate))}
                  <span className="ml-2 text-gray-500">
                    ({product.count})
                  </span>
                </div>
                <p className="text-2xl font-semibold">${product.price}</p>
              </div>
              <button
                onClick={() => {
                  dispatch({ type: "ADD_ITEM", payload: product });
                  toast.success("Added to cart successfully!");
                  animateToCart(imageRefs.current[index]);
                }}
                className="w-full bg-[#2F2F2F] text-white py-2 rounded-full hover:bg-gray-800 transition-all duration-200 cursor-pointer"
              >
                Add to cart
              </button>
            </div>
            ))}
          </div>
        </main>
      </div>

      {/* Mobile Filters Modal */}
      <MobileFilters
        isOpen={isMobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
      >
        <ProductFilters
          categories={categories}
          priceRanges={priceRanges}
          onFiltersChange={handleFiltersChange}
        />
      </MobileFilters>

      <div ref={cartIconRef} className="fixed top-4 right-4 z-50">
        <div className="relative">
          <div
            className="bg-white  shadow-lg rounded-full p-3 cursor-pointer"
            onClick={() => setCartOpen(true)}
          >
            <FaShoppingCart className="text-xl text-gray-700" />
          </div>
          {cartCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
              {cartCount}
            </div>
          )}
        </div>
      </div>

      {/* Fly-out Cart Drawer */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-[#eeeeee]/50 backdrop-blur-sm z-40"
          onClick={() => setCartOpen(false)}
        />
      )}
      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
