export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default function ApplyPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold">Apply for Services</h1>
      <p className="mt-4 text-gray-600">Application form coming soon.</p>
    </div>
  );
}
