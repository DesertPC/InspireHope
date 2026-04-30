export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default function DonatePage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold">Donate</h1>
      <p className="mt-4 text-gray-600">Support our mission with a donation.</p>
    </div>
  );
}
