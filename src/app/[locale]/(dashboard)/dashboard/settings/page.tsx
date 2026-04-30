export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-4 text-gray-600">Configure dashboard preferences.</p>
    </div>
  );
}
