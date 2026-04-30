export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default function CasesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Cases</h1>
      <p className="mt-4 text-gray-600">Manage senior cases.</p>
    </div>
  );
}
