export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default function ExpensesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Expenses</h1>
      <p className="mt-4 text-gray-600">Manage organizational expenses.</p>
    </div>
  );
}
