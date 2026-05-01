import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Car,
  Home,
  HeartPulse,
  HandHeart,
  Apple,
  Heart,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

const programs = [
  {
    icon: Car,
    title: "Transportation Assistance",
    color: "bg-blue-50 text-blue-600",
    description:
      "Reliable transportation for medical appointments, grocery shopping, pharmacy visits, and essential errands. Our volunteer drivers ensure seniors without access to a vehicle can maintain their independence and health.",
    features: [
      "Door-to-door service",
      "Medical appointment priority scheduling",
      "Grocery and pharmacy runs",
      "Wheelchair-accessible vehicles available",
    ],
  },
  {
    icon: Home,
    title: "Housing Stability Program",
    color: "bg-orange-50 text-orange-600",
    description:
      "Emergency rent assistance, eviction prevention support, and housing navigation services for seniors facing housing insecurity. We work with landlords, social services, and legal aid to keep seniors housed.",
    features: [
      "Emergency rental assistance",
      "Eviction prevention advocacy",
      "Utility bill support",
      "Referrals to affordable senior housing",
    ],
  },
  {
    icon: HeartPulse,
    title: "Wellness & Health Navigation",
    color: "bg-red-50 text-red-600",
    description:
      "Health screenings, medication management support, wellness education, and navigation of Medicare/Medi-Cal benefits. We help seniors understand and access the healthcare services they need.",
    features: [
      "Free health screenings",
      "Medication reminder programs",
      "Medicare/Medi-Cal enrollment help",
      "Chronic disease management support",
    ],
  },
  {
    icon: HandHeart,
    title: "Personalized Case Management",
    color: "bg-purple-50 text-purple-600",
    description:
      "Dedicated case managers who assess needs, coordinate services, and provide ongoing support. Each senior receives a customized care plan that evolves as their needs change.",
    features: [
      "Comprehensive needs assessment",
      "Service coordination",
      "Benefits enrollment assistance",
      "Regular check-ins and follow-ups",
    ],
  },
  {
    icon: Apple,
    title: "Food & Nutrition Support",
    color: "bg-green-50 text-green-600",
    description:
      "Meal delivery programs, nutrition education, and emergency food support for food-insecure seniors. We partner with local food banks and meal providers to ensure no senior goes hungry.",
    features: [
      "Home-delivered meals",
      "Grocery delivery partnerships",
      "Nutrition counseling",
      "SNAP enrollment assistance",
    ],
  },
  {
    icon: Heart,
    title: "Funeral & Bereavement Support",
    color: "bg-rose-50 text-rose-600",
    description:
      "Dignity in final arrangements through funeral coordination, financial assistance for families, and grief counseling referrals. We help families navigate difficult times with compassion.",
    features: [
      "Funeral coordination assistance",
      "Financial support for final arrangements",
      "Grief counseling referrals",
      "Veterans burial benefit navigation",
    ],
  },
];

export default function ProgramsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(249,115,22,0.3),transparent_50%)]" />
        </div>
        <div className="relative container mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-sm px-4 py-1">
              Comprehensive Services
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Our Programs
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              From transportation to housing support, we offer a full spectrum of services
              designed to help seniors live with dignity and independence.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {programs.map((program) => (
              <Card key={program.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${program.color.split(" ")[0]} flex items-center justify-center`}>
                      <program.icon className={`h-6 w-6 ${program.color.split(" ")[1]}`} />
                    </div>
                    <CardTitle>{program.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {program.description}
                  </p>
                  <ul className="space-y-2">
                    {program.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Need Help?</h2>
            <p className="text-muted-foreground text-lg">
              If you or a loved one could benefit from any of our programs, we encourage you to
              apply for services. Our team will assess your needs and connect you with the
              appropriate resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <Link href="/en/apply">
                  Apply for Services
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/en/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
