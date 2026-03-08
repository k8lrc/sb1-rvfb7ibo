import { TornadoIndex } from '../lib/supabase';
import { Wind, Gauge, Zap, TrendingUp } from 'lucide-react';

interface TornadoIndexCardProps {
  data: TornadoIndex;
}

const getRiskColor = (index: number) => {
  if (index >= 8) return 'text-red-600';
  if (index >= 6) return 'text-orange-600';
  if (index >= 4) return 'text-yellow-600';
  return 'text-green-600';
};

const getRiskBgColor = (index: number) => {
  if (index >= 8) return 'bg-red-100 border-red-300';
  if (index >= 6) return 'bg-orange-100 border-orange-300';
  if (index >= 4) return 'bg-yellow-100 border-yellow-300';
  return 'bg-green-100 border-green-300';
};

const getRiskBarColor = (index: number) => {
  if (index >= 8) return 'bg-gradient-to-r from-red-500 to-red-700';
  if (index >= 6) return 'bg-gradient-to-r from-orange-500 to-orange-700';
  if (index >= 4) return 'bg-gradient-to-r from-yellow-500 to-yellow-700';
  return 'bg-gradient-to-r from-green-500 to-green-700';
};

const getRiskLabel = (level: string) => {
  const labels = {
    low: 'Low Risk',
    moderate: 'Moderate Risk',
    high: 'High Risk',
    extreme: 'Extreme Risk',
  };
  return labels[level as keyof typeof labels] || level;
};

export default function TornadoIndexCard({ data }: TornadoIndexCardProps) {
  const indexPercent = (data.baron_index / 10) * 100;
  const measuredDate = new Date(data.measured_at);

  return (
    <div className={`${getRiskBgColor(data.baron_index)} rounded-lg border-2 shadow-md p-5 transition-all hover:shadow-xl`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">{data.location}</h3>
          <p className="text-sm text-gray-600">
            Updated: {measuredDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
        <div className={`text-right ${getRiskColor(data.baron_index)}`}>
          <div className="text-3xl font-bold">{data.baron_index.toFixed(1)}</div>
          <div className="text-xs font-semibold uppercase tracking-wide">
            {getRiskLabel(data.risk_level)}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Baron Tornado Index</span>
          <span className="text-xs text-gray-500">0-10 Scale</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${getRiskBarColor(data.baron_index)} transition-all duration-1000 ease-out rounded-full shadow-inner`}
            style={{ width: `${indexPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white bg-opacity-60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Wind className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase">Wind Shear</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {data.wind_shear?.toFixed(1) || 'N/A'} <span className="text-xs">kt</span>
          </div>
        </div>

        <div className="bg-white bg-opacity-60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase">CAPE</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {data.cape_value?.toFixed(0) || 'N/A'} <span className="text-xs">J/kg</span>
          </div>
        </div>

        <div className="bg-white bg-opacity-60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase">Helicity</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {data.helicity?.toFixed(0) || 'N/A'} <span className="text-xs">m²/s²</span>
          </div>
        </div>

        <div className="bg-white bg-opacity-60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Gauge className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase">Coords</span>
          </div>
          <div className="text-xs font-bold text-gray-800">
            {data.latitude.toFixed(2)}, {data.longitude.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
