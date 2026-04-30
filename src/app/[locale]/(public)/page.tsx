export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default function HomePage() {
  return <div>Home works!</div>;
}
