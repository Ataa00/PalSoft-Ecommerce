import { NextResponse } from "next/server";

export async function GET() {
  // During build time or when API is not available, return fallback data immediately
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_BASE_URL) {
    const { products: fallbackProducts } = await import("@/data/products");

    const transformedProducts = fallbackProducts.map(product => ({
      id: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      image: product.image,
      rate: product.rating.rate,
      count: product.rating.count,
      sizes: [
        { size: "S", quantity: 10 },
        { size: "M", quantity: 15 },
        { size: "L", quantity: 8 },
        { size: "XL", quantity: 5 }
      ],
      tag: product.tag
    }));

    return NextResponse.json(transformedProducts);
  }

  try {
    // Dynamic import to avoid build-time execution issues
    const { default: ProductService } = await import("@/services/product.service");
    const products = await ProductService.getAllProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products from API, returning fallback data:', error);

    // Import fallback data dynamically
    const { products: fallbackProducts } = await import("@/data/products");

    // Transform fallback products to match API structure
    const transformedProducts = fallbackProducts.map(product => ({
      id: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      image: product.image,
      rate: product.rating.rate,
      count: product.rating.count,
      sizes: [
        { size: "S", quantity: 10 },
        { size: "M", quantity: 15 },
        { size: "L", quantity: 8 },
        { size: "XL", quantity: 5 }
      ],
      tag: product.tag
    }));

    return NextResponse.json(transformedProducts);
  }
}
