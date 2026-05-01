import { getPublicStats } from "@/actions/dashboard.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Heart,
  HandHeart,
  Home,
  Car,
  Apple,
  HeartPulse,
  Users,
  FolderOpen,
  DollarSign,
  Wallet,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { getTranslations } from "next-intl/server";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

const serviceDefs = [
  { key: "transportation", icon: Car },
  { key: "housing", icon: Home },
  { key: "wellness", icon: HeartPulse },
  { key: "caseManagement", icon: HandHeart },
  { key: "food", icon: Apple },
  { key: "funeral", icon: Heart },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const stats = await getPublicStats();
  const t = await getTranslations();

  const services = serviceDefs.map(({ key, icon }) => ({
    icon,
    title: t(`home.services.${key}.title`),
    description: t(`home.services.${key}.description`),
  }));

  const whyUs = t.raw("home.whyUs.items") as string[];

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative text-white overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/hero-bg.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/60" />
        </div>
        <div className="relative container mx-auto px-6 py-24 lg:py-32">
          <div className="absolute top-4 right-4">
            <LocaleSwitcher />
          </div>
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-sm px-4 py-1">
              {t("home.hero.badge")}
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              {t.rich("home.hero.title", {
                highlight: (chunks) => (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                    {chunks}
                  </span>
                ),
              })}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t("home.hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white h-14 px-8 text-lg">
                <Link href={`/${locale}/donate`}>
                  <Heart className="h-5 w-5 mr-2" />
                  {t("home.hero.ctaDonate")}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 h-14 px-8 text-lg">
                <Link href={`/${locale}/apply`}>
                  {t("home.hero.ctaApply")}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT STATS */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-slate-900">{stats.seniorsCount}</div>
                <div className="text-sm text-muted-foreground">{t("home.stats.seniorsServed")}</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6 text-center">
                <FolderOpen className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-slate-900">{stats.casesCount}</div>
                <div className="text-sm text-muted-foreground">{t("home.stats.activeCases")}</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6 text-center">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-slate-900">
                  ${Math.round(stats.totalDonations).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">{t("home.stats.donationsReceived")}</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6 text-center">
                <Wallet className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-slate-900">
                  ${Math.round(stats.totalExpenses).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">{t("home.stats.investedInPrograms")}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("home.services.title")}</h2>
            <p className="text-muted-foreground text-lg">
              {t("home.services.subtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.title} className="group border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <service.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT / MISSION */}
      <section className="relative text-white py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/mission-bg.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/70" />
        </div>
        <div className="relative container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                {t("home.mission.title")}
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                {t("home.mission.paragraph1")}
              </p>
              <p className="text-slate-300 text-lg leading-relaxed">
                {t("home.mission.paragraph2")}
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Badge variant="outline" className="border-white/30 text-white">
                  <Shield className="h-3 w-3 mr-1" />
                  {t("home.mission.einBadge")}
                </Badge>
                <Badge variant="outline" className="border-white/30 text-white">
                  {t("home.mission.locationBadge")}
                </Badge>
              </div>
            </div>
            <div className="space-y-4">
              {whyUs.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                  <span className="text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW TO HELP */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("home.help.title")}</h2>
            <p className="text-muted-foreground text-lg">
              {t("home.help.subtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0">
                <img src="/images/donate-card-bg.jpg" alt="" className="w-full h-full object-cover opacity-40" />
              </div>
              <CardContent className="relative pt-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold">{t("home.help.donate.title")}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("home.help.donate.description")}
                </p>
                <Button asChild className="bg-orange-500 hover:bg-orange-600">
                  <Link href={`/${locale}/donate`}>
                    {t("home.help.donate.cta")}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0">
                <img src="/images/apply-card-bg.jpg" alt="" className="w-full h-full object-cover opacity-40" />
              </div>
              <CardContent className="relative pt-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <HandHeart className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold">{t("home.help.apply.title")}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("home.help.apply.description")}
                </p>
                <Button asChild variant="outline" className="border-blue-300 hover:bg-blue-50">
                  <Link href={`/${locale}/apply`}>
                    {t("home.help.apply.cta")}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">{t("home.contact.title")}</h2>
            <p className="text-muted-foreground">
              {t("home.contact.subtitle")}
            </p>
            <div className="grid sm:grid-cols-3 gap-6 pt-4">
              <div className="flex flex-col items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-muted-foreground">{t("home.contact.addressLine1")}</span>
                <span className="text-sm text-muted-foreground">{t("home.contact.addressLine2")}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-muted-foreground">{t("home.contact.phone")}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-muted-foreground">{t("home.contact.email")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold text-lg mb-2">{t("home.footer.orgName")}</h4>
              <p className="text-sm">
                {t("home.footer.tagline")}
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">{t("home.footer.quickLinks")}</h4>
              <div className="flex flex-col gap-1 text-sm">
                <Link href={`/${locale}/donate`} className="hover:text-white transition-colors">{t("home.footer.donate")}</Link>
                <Link href={`/${locale}/apply`} className="hover:text-white transition-colors">{t("home.footer.apply")}</Link>
                <Link href={`/${locale}/about`} className="hover:text-white transition-colors">{t("home.footer.about")}</Link>
                <Link href={`/${locale}/contact`} className="hover:text-white transition-colors">{t("home.footer.contact")}</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">{t("home.footer.legal")}</h4>
              <div className="flex flex-col gap-1 text-sm">
                <span>{t("home.footer.nonprofit")}</span>
                <span>{t("home.footer.ein")}</span>
                <span>{t("home.footer.npi")}</span>
                <span>{t("home.footer.taxDeductible")}</span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-sm text-center">
            {t("home.footer.copyright", { year: new Date().getFullYear() })}
          </div>
        </div>
      </footer>
    </div>
  );
}
