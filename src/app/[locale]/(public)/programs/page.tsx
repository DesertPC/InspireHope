export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default function ProgramsPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold">Our Programs</h1>
      <p className="mt-4 text-gray-600">Discover the services we offer for seniors.</p>
    </div>
  );
}
