export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold">About Us</h1>
      <p className="mt-4 text-gray-600">
        InspireHope Senior Center of Coachella Valley is a 501(c)(3) nonprofit organization.
      </p>
    </div>
  );
}
