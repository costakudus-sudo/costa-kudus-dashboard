import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardCards from "./components/DashboardCards";

export default function Home() {
  return (
    <main className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <section className="flex-1 p-8 overflow-y-auto">
        <Header />

        <DashboardCards />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
          {/* Revenue */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Revenue Overview
                </h2>
                <p className="text-slate-500 text-sm">
                  Monthly business performance
                </p>
              </div>

              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">
                View Report
              </button>
            </div>

            <div className="h-80 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
              Revenue Chart (Next)
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="font-bold text-lg mb-4">
                Recent Activities
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="font-medium">Passport Photo</p>
                  <span className="text-sm text-slate-500">
                    Completed 10 mins ago
                  </span>
                </div>

                <div>
                  <p className="font-medium">Invoice Generated</p>
                  <span className="text-sm text-slate-500">
                    Today
                  </span>
                </div>

                <div>
                  <p className="font-medium">Printing Job</p>
                  <span className="text-sm text-slate-500">
                    Awaiting pickup
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="font-bold text-lg mb-4">
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <button className="rounded-xl bg-blue-600 text-white py-3">
                  Client
                </button>

                <button className="rounded-xl bg-emerald-600 text-white py-3">
                  Invoice
                </button>

                <button className="rounded-xl bg-orange-500 text-white py-3">
                  Payment
                </button>

                <button className="rounded-xl bg-purple-600 text-white py-3">
                  Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}