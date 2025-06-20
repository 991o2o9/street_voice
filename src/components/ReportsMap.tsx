/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Report } from '../types';
import { getSentimentColor } from '../utils/dataProcessing';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface ReportsMapProps {
  reports: Report[];
}

export default function ReportsMap({ reports }: ReportsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [39.8283, -98.5795],
        4
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapInstanceRef.current);
    }

    markersRef.current.forEach((marker) => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    reports.forEach((report) => {
      if (!mapInstanceRef.current) return;

      const color = report.sentiment
        ? getSentimentColor(report.sentiment)
        : '#6B7280';

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [15, 15],
        iconAnchor: [7.5, 7.5],
      });

      const marker = L.marker(report.coordinates, { icon: customIcon })
        .bindPopup(
          `
          <div class="max-w-xs">
            <div class="font-semibold text-gray-900 mb-2">${
              report.district
            }</div>
            <div class="text-sm text-gray-700 mb-2">${report.text}</div>
            <div class="flex flex-wrap gap-1 text-xs">
              ${
                report.category
                  ? `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">${report.category}</span>`
                  : ''
              }
              ${
                report.sentiment
                  ? `<span class="bg-gray-100 text-gray-800 px-2 py-1 rounded">${report.sentiment}</span>`
                  : ''
              }
            </div>
            <div class="text-xs text-gray-500 mt-2">${new Date(
              report.timestamp
            ).toLocaleString('en-US')}</div>
          </div>
        `
        )
        .addTo(mapInstanceRef.current);

      markersRef.current.push(marker);
    });

    if (reports.length > 0 && mapInstanceRef.current) {
      if (reports.length === 1) {
        const report = reports[0];
        mapInstanceRef.current.setView(report.coordinates, 12);
      } else {
        const bounds = L.latLngBounds(
          reports.map((report) => report.coordinates)
        );
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
        });
      }
    }

    return () => {
      markersRef.current.forEach((marker) => {
        mapInstanceRef.current?.removeLayer(marker);
      });
      markersRef.current = [];
    };
  }, [reports]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Report Map
        </h2>
        <div className="flex items-center space-x-4 mt-2 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Negative</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Neutral</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Positive</span>
          </div>
        </div>
      </div>
      <div ref={mapRef} className="w-full h-96 rounded-b-lg" />
    </div>
  );
}
