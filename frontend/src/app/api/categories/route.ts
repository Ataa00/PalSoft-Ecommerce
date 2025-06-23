import { NextResponse } from "next/server";

// Fallback categories for when API is not available or during build time
const fallbackCategories = [
  { category: "men", image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg" },
  { category: "women", image: "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg" },
  { category: "jewelery", image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg" },
  { category: "electronics", image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg" }
];

export async function GET() {
  // During build time or when API is not available, return fallback data immediately
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_BASE_URL) {
    return NextResponse.json(fallbackCategories);
  }

  try {
    // Dynamic import to avoid build-time execution issues
    const { default: ProductService } = await import("@/services/product.service");

    const products = await ProductService.getAllProducts();
    const categoriesMap = new Map();

    for (const item of products) {
      if (!categoriesMap.has(item.category)) {
        categoriesMap.set(item.category, item.image || '');
      }
    }

    const categories = Array.from(categoriesMap.entries()).map(
      ([category, image]) => ({
        category,
        image,
      })
    );

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories from API, returning fallback:', error);
    return NextResponse.json(fallbackCategories);
  }
}
