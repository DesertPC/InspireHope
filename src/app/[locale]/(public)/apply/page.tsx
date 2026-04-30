import { ApplyForm } from "./apply-form";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default function ApplyPage() {
  return <ApplyForm />;
}
