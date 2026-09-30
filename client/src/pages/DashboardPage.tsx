import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrCreateRaceDay, getOrCreateBetStats } from '../services/dashboard';
import { countWins, SNAIL_NAMES } from '../utils/simulation';
import { formatCurrency } from '../utils/format';
import Card from '../components/ui/Card';
import BetsDonutChart from '../components/charts/BetsDonutChart';
import SnailWinsBarChart from '../components/charts/SnailWinsBarChart';
import RechargeForm from '../components/recharge/RechargeForm';

function DashboardPage() {
  const { user, logout } = useAuth();

  // Hooks: todos antes de cualquier return
  const raceDay = useMemo(() => getOrCreateRaceDay(), []);

  const snailResults = useMemo(
    () => countWins(SNAIL_NAMES, raceDay.winners),
    [raceDay]
  );

  const betStats = useMemo(
    () => (user ? getOrCreateBetStats(user.userId, raceDay.winners) : null),
    [user, raceDay]
  );

  if (!user || !betStats) return null;

  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold">Snail Casa de apuestas</span>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-600 sm:inline">
              Hola, <strong>{user.name}</strong>
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-4 p-4">
        <Card title="Saldo actual">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <p className="text-4xl font-bold">{formatCurrency(user.balance)}</p>
            <button
              type="button"
              onClick={() => setIsRechargeOpen(isOpen => !isOpen)}
              aria-expanded={isRechargeOpen}
              className="rounded-2xl bg-black px-4 py-2 text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              {isRechargeOpen ? 'Ocultar recarga' : 'Recargar saldo'}
            </button>
          </div>
        </Card>

        {isRechargeOpen && <RechargeForm onClose={() => setIsRechargeOpen(false)} />}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card title="Mis apuestas del día">
                <BetsDonutChart stats={betStats} />
            </Card>

            <Card title="Victorias por caracol (6 carreras)">
                <SnailWinsBarChart results={snailResults} />
            </Card>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;