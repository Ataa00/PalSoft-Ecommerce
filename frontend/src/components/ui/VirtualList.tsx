"use client";

import { useVirtualScroll } from '@/hooks/usePerformance';
import { ReactNode } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
}

export default function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = '',
  overscan = 5,
  onScroll,
}: VirtualListProps<T>) {
  const { visibleItems, totalHeight, offsetY, handleScroll } = useVirtualScroll(
    items,
    itemHeight,
    containerHeight,
    overscan
  );

  const handleScrollEvent = (e: React.UIEvent<HTMLDivElement>) => {
    handleScroll(e);
    onScroll?.(e.currentTarget.scrollTop);
  };

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScrollEvent}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{
                height: itemHeight,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Specialized virtual list for products
interface VirtualProductListProps {
  products: { id: number; title: string; price: number; image?: string }[];
  renderProduct: (product: { id: number; title: string; price: number; image?: string }, index: number) => ReactNode;
  className?: string;
  height?: number;
}

export function VirtualProductList({
  products,
  renderProduct,
  className = '',
  height = 600,
}: VirtualProductListProps) {
  return (
    <VirtualList
      items={products}
      itemHeight={120} // Typical product card height
      containerHeight={height}
      renderItem={renderProduct}
      className={className}
      overscan={3}
    />
  );
}

// Infinite scroll virtual list
interface InfiniteVirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  hasNextPage: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  className?: string;
  loadingComponent?: ReactNode;
}

export function InfiniteVirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  hasNextPage,
  isLoading,
  onLoadMore,
  className = '',
  loadingComponent,
}: InfiniteVirtualListProps<T>) {
  const { visibleItems, totalHeight, offsetY, handleScroll } = useVirtualScroll(
    items,
    itemHeight,
    containerHeight,
    5
  );

  const handleScrollEvent = (e: React.UIEvent<HTMLDivElement>) => {
    handleScroll(e);
    
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // Load more when 80% scrolled and not already loading
    if (scrollPercentage > 0.8 && hasNextPage && !isLoading) {
      onLoadMore();
    }
  };

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScrollEvent}
    >
      <div style={{ height: totalHeight + (hasNextPage ? itemHeight : 0), position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{
                height: itemHeight,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
          
          {/* Loading indicator */}
          {hasNextPage && (
            <div
              style={{
                height: itemHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {loadingComponent || (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-gray-600">Loading more...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Grid virtual list for product grids
interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  gap?: number;
  className?: string;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  gap = 16,
  className = '',
}: VirtualGridProps<T>) {
  const itemsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const rowHeight = itemHeight + gap;
  const totalRows = Math.ceil(items.length / itemsPerRow);

  const { visibleItems, totalHeight, offsetY, handleScroll } = useVirtualScroll(
    Array.from({ length: totalRows }, (_, rowIndex) => {
      const startIndex = rowIndex * itemsPerRow;
      const endIndex = Math.min(startIndex + itemsPerRow, items.length);
      return items.slice(startIndex, endIndex);
    }),
    rowHeight,
    containerHeight,
    2
  );

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item: rowItems, index: rowIndex }) => (
            <div
              key={rowIndex}
              style={{
                height: rowHeight,
                display: 'flex',
                gap: gap,
                alignItems: 'flex-start',
                paddingBottom: gap,
              }}
            >
              {rowItems.map((item, itemIndex) => {
                const globalIndex = (visibleItems[0]?.index || 0) * itemsPerRow + rowIndex * itemsPerRow + itemIndex;
                return (
                  <div
                    key={globalIndex}
                    style={{
                      width: itemWidth,
                      height: itemHeight,
                      flexShrink: 0,
                    }}
                  >
                    {renderItem(item, globalIndex)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
