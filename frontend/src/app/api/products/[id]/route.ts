import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // During build time, return a mock product
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_BASE_URL) {
      return NextResponse.json({
        id: productId,
        title: "Sample Product",
        price: 99.99,
        description: "This is a sample product description.",
        category: "sample",
        image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
        rate: 4.5,
        count: 120,
        sizes: [
          { id: 1, size: "S", quantity: 10 },
          { id: 2, size: "M", quantity: 15 },
          { id: 3, size: "L", quantity: 8 },
          { id: 4, size: "XL", quantity: 5 }
        ]
      });
    }

    // Dynamic import to avoid build-time execution issues
    const { default: ProductService } = await import("@/services/product.service");
    const product = await ProductService.getProductById(productId);
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);

    // Return fallback product data
    const { id } = await context.params;
    const productId = parseInt(id);

    return NextResponse.json({
      id: productId,
      title: "Product Not Available",
      price: 0,
      description: "This product is currently not available.",
      category: "unavailable",
      image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
      rate: 0,
      count: 0,
      sizes: []
    });
  }
}
