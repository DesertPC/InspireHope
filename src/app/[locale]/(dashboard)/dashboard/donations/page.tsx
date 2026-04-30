export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default function DonationsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Donations</h1>
      <p className="mt-4 text-gray-600">Track and manage donations.</p>
    </div>
  );
}
