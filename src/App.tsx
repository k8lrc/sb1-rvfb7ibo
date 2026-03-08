import { useEffect, useState } from 'react';
import { supabase, WeatherAlert, TornadoIndex } from './lib/supabase';
import WeatherAlertCard from './components/WeatherAlertCard';
import TornadoIndexCard from './components/TornadoIndexCard';
import { AlertCircle, CloudRain, RefreshCw, Activity } from 'lucide-react';

function App() {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [tornadoData, setTornadoData] = useState<TornadoIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [alertsResponse, tornadoResponse] = await Promise.all([
        supabase
          .from('weather_alerts')
          .select('*')
          .eq('is_active', true)
          .order('severity', { ascending: false }),
        supabase
          .from('tornado_index')
          .select('*')
          .order('baron_index', { ascending: false })
          .limit(5),
      ]);

      if (alertsResponse.data) setAlerts(alertsResponse.data);
      if (tornadoResponse.data) setTornadoData(tornadoResponse.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const alertsSubscription = supabase
      .channel('weather_alerts_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'weather_alerts' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const tornadoSubscription = supabase
      .channel('tornado_index_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tornado_index' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      fetchData();
    }, 60000);

    return () => {
      alertsSubscription.unsubscribe();
      tornadoSubscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const activeAlertsCount = alerts.length;
  const extremeAlertsCount = alerts.filter(a => a.severity === 'extreme').length;
  const highRiskCount = tornadoData.filter(t => t.baron_index >= 6).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                <CloudRain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Weather Alert System</h1>
                <p className="text-slate-400 text-sm mt-1">Real-time monitoring with Baron Tornado Index</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-semibold">Active Alerts</p>
                  <p className="text-3xl font-bold text-white mt-1">{activeAlertsCount}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-semibold">Extreme Alerts</p>
                  <p className="text-3xl font-bold text-red-500 mt-1">{extremeAlertsCount}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-semibold">High Risk Areas</p>
                  <p className="text-3xl font-bold text-orange-500 mt-1">{highRiskCount}</p>
                </div>
                <Activity className="w-10 h-10 text-orange-500" />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-semibold">Last Update</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {lastUpdate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
                <RefreshCw className="w-10 h-10 text-green-500" />
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-bold text-white">Active Weather Alerts</h2>
            </div>

            {loading && alerts.length === 0 ? (
              <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
                <RefreshCw className="w-12 h-12 text-slate-500 animate-spin mx-auto mb-3" />
                <p className="text-slate-400">Loading alerts...</p>
              </div>
            ) : alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <WeatherAlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-semibold">No active alerts</p>
                <p className="text-slate-500 text-sm mt-2">All clear in monitored areas</p>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-white">Baron Tornado Index</h2>
            </div>

            {loading && tornadoData.length === 0 ? (
              <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
                <RefreshCw className="w-12 h-12 text-slate-500 animate-spin mx-auto mb-3" />
                <p className="text-slate-400">Loading tornado data...</p>
              </div>
            ) : tornadoData.length > 0 ? (
              <div className="space-y-4">
                {tornadoData.map((data) => (
                  <TornadoIndexCard key={data.id} data={data} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
                <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-semibold">No tornado index data</p>
                <p className="text-slate-500 text-sm mt-2">Data will appear when available</p>
              </div>
            )}
          </section>
        </div>

        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>Weather Alert System • Real-time monitoring powered by Supabase</p>
          <p className="mt-1">Baron Tornado Index combines wind shear, CAPE, and helicity measurements</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
