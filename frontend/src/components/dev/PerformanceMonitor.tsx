"use client";

import { useState, useEffect } from 'react';
import { useMemoryMonitor, usePerformanceMonitor } from '@/hooks/usePerformance';
import CacheService from '@/services/cache.service';

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export default function PerformanceMonitor({ 
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right'
}: PerformanceMonitorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [renderCount, setRenderCount] = useState(0);
  const memoryInfo = useMemoryMonitor();
  const { mark } = usePerformanceMonitor('PerformanceMonitor');

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    mark('render');
  }, [mark]);

  if (!enabled) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const cacheStats = CacheService.getStats();

  const formatBytes = (bytes: number | undefined) => {
    if (bytes === undefined || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        title="Performance Monitor"
      >
        📊
      </button>

      {/* Performance Panel */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Performance Monitor</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Render Stats */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Render Stats</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Renders:</span>
                <span className="font-mono">{renderCount}</span>
              </div>
            </div>
          </div>

          {/* Memory Stats */}
          {memoryInfo && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Memory Usage</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span className="font-mono">{formatBytes(memoryInfo.usedJSHeapSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-mono">{formatBytes(memoryInfo.totalJSHeapSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Limit:</span>
                  <span className="font-mono">{formatBytes(memoryInfo.jsHeapSizeLimit)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${memoryInfo.usedJSHeapSize && memoryInfo.jsHeapSizeLimit
                        ? (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100
                        : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Cache Stats */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Cache Stats</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Memory Cache:</span>
                <span className="font-mono">{cacheStats.memory.size} items</span>
              </div>
              <div className="flex justify-between">
                <span>LocalStorage:</span>
                <span className="font-mono">{cacheStats.localStorage.items} items</span>
              </div>
              <div className="flex justify-between">
                <span>SessionStorage:</span>
                <span className="font-mono">{cacheStats.sessionStorage.items} items</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Performance</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>FCP:</span>
                <span className="font-mono">
                  {performance.getEntriesByType('paint')
                    .find(entry => entry.name === 'first-contentful-paint')?.startTime.toFixed(2) || 'N/A'}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span>LCP:</span>
                <span className="font-mono">
                  {performance.getEntriesByType('largest-contentful-paint')[0]?.startTime.toFixed(2) || 'N/A'}ms
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => {
                CacheService.clear();
                alert('Memory cache cleared');
              }}
              className="w-full bg-red-500 text-white py-1 px-2 rounded text-sm hover:bg-red-600"
            >
              Clear Memory Cache
            </button>
            <button
              onClick={() => {
                CacheService.clear({ storage: 'localStorage' });
                alert('LocalStorage cache cleared');
              }}
              className="w-full bg-orange-500 text-white py-1 px-2 rounded text-sm hover:bg-orange-600"
            >
              Clear LocalStorage Cache
            </button>
            <button
              onClick={() => {
                if (window.gc) {
                  window.gc();
                  alert('Garbage collection triggered');
                } else {
                  alert('Garbage collection not available');
                }
              }}
              className="w-full bg-blue-500 text-white py-1 px-2 rounded text-sm hover:bg-blue-600"
            >
              Force GC
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Performance metrics component for production
export function PerformanceMetrics() {
  useEffect(() => {
    // Report Core Web Vitals
    const reportWebVitals = (metric: { name: string; value: number; id: string; delta: number }) => {
      console.log(metric);
      
      // Send to analytics
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as { gtag: (...args: unknown[]) => void }).gtag('event', metric.name, {
          value: Math.round(metric.value),
          metric_id: metric.id,
          metric_value: metric.value,
          metric_delta: metric.delta,
        });
      }
    };

    // Dynamically import web-vitals
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(reportWebVitals);
      onINP(reportWebVitals);
      onFCP(reportWebVitals);
      onLCP(reportWebVitals);
      onTTFB(reportWebVitals);
    }).catch(() => {
      // web-vitals not available
    });
  }, []);

  return null;
}

// Bundle analyzer component
export function BundleAnalyzer() {
  const [bundleInfo, setBundleInfo] = useState<{ totalScripts: number; estimatedSize: number } | null>(null);

  useEffect(() => {
    // Analyze bundle size in development
    if (process.env.NODE_ENV === 'development') {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const totalSize = scripts.reduce((acc, script) => {
        const src = (script as HTMLScriptElement).src;
        if (src.includes('/_next/')) {
          // Estimate size based on script name patterns
          if (src.includes('chunks/pages')) return acc + 50000; // ~50KB
          if (src.includes('chunks/main')) return acc + 100000; // ~100KB
          if (src.includes('chunks/framework')) return acc + 200000; // ~200KB
          return acc + 10000; // ~10KB for other chunks
        }
        return acc;
      }, 0);

      setBundleInfo({
        totalScripts: scripts.length,
        estimatedSize: totalSize,
      });
    }
  }, []);

  if (!bundleInfo || process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-4 left-4 bg-yellow-100 border border-yellow-400 rounded p-2 text-xs">
      <div>Scripts: {bundleInfo.totalScripts}</div>
      <div>Est. Size: {(bundleInfo.estimatedSize / 1024).toFixed(1)}KB</div>
    </div>
  );
}

// Declare global gc function for TypeScript
declare global {
  interface Window {
    gc?: () => void;
  }
}
