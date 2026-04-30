export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="mt-4 text-gray-600">Get in touch with InspireHope Senior Center.</p>
    </div>
  );
}
