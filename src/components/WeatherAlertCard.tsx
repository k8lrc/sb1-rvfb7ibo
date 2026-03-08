import { AlertTriangle, CloudLightning, Droplets, Wind, Clock } from 'lucide-react';
import { WeatherAlert } from '../lib/supabase';

interface WeatherAlertCardProps {
  alert: WeatherAlert;
}

const severityColors = {
  extreme: 'bg-red-600 border-red-700',
  severe: 'bg-orange-600 border-orange-700',
  moderate: 'bg-yellow-600 border-yellow-700',
  minor: 'bg-blue-600 border-blue-700',
};

const alertIcons = {
  tornado: AlertTriangle,
  severe_thunderstorm: CloudLightning,
  flash_flood: Droplets,
  high_wind: Wind,
};

export default function WeatherAlertCard({ alert }: WeatherAlertCardProps) {
  const Icon = alertIcons[alert.alert_type as keyof typeof alertIcons] || AlertTriangle;
  const colorClass = severityColors[alert.severity as keyof typeof severityColors] || severityColors.moderate;

  const issuedDate = new Date(alert.issued_at);
  const expiresDate = new Date(alert.expires_at);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className={`${colorClass} rounded-lg border-2 shadow-lg overflow-hidden transition-transform hover:scale-105`}>
      <div className="p-4 text-white">
        <div className="flex items-start gap-3">
          <Icon className="w-8 h-8 flex-shrink-0 mt-1" />
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold mb-1">{alert.title}</h3>
            <p className="text-sm font-semibold mb-2 uppercase tracking-wide opacity-90">
              {alert.alert_type.replace(/_/g, ' ')} • {alert.severity}
            </p>
            <p className="text-sm mb-3 leading-relaxed">{alert.description}</p>

            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Location:</span>
                <span>{alert.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">Issued:</span>
                <span>{formatTime(issuedDate)}</span>
                <span className="mx-2">•</span>
                <span className="font-semibold">Expires:</span>
                <span>{formatTime(expiresDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
