export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4 text-gray-600">Welcome to the InspireHope management dashboard.</p>
    </div>
  );
}
