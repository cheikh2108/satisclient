export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-6xl font-bold text-center mb-8">
          🎯 SatisClient
        </h1>
        <p className="text-xl text-center text-gray-600 mb-8">
          Plateforme de gestion de satisfaction et réclamations
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">📊 Analytics</h3>
            <p className="text-gray-600">
              Tableaux de bord temps réel et KPIs
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">📋 Réclamations</h3>
            <p className="text-gray-600">
              Workflow complet avec SLA et escalades
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">⭐ Satisfaction</h3>
            <p className="text-gray-600">
              Avis, notations et enquêtes personnalisées
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-12">
          <a
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Accéder au Dashboard
          </a>
          <a
            href="/api/docs"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            target="_blank"
          >
            Documentation API
          </a>
        </div>
      </div>
    </main>
  );
}
