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

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

const services = [
  {
    icon: Car,
    title: "Transportation",
    description: "Medical appointments, grocery shopping, and essential errands for seniors without access to reliable transport.",
  },
  {
    icon: Home,
    title: "Housing Assistance",
    description: "Emergency rent support, eviction prevention, and housing stability programs for vulnerable seniors.",
  },
  {
    icon: HeartPulse,
    title: "Wellness Programs",
    description: "Health screenings, medication management support, and wellness activities to improve quality of life.",
  },
  {
    icon: HandHeart,
    title: "Case Management",
    description: "Personalized case managers who coordinate services, benefits navigation, and ongoing support.",
  },
  {
    icon: Apple,
    title: "Food Assistance",
    description: "Meal delivery, nutrition programs, and emergency food support for food-insecure seniors.",
  },
  {
    icon: Heart,
    title: "Funeral Support",
    description: "Dignity in final arrangements through funeral coordination and financial assistance for bereaved families.",
  },
];

const whyUs = [
  "501(c)(3) nonprofit — all donations are tax-deductible",
  "100% of donations go directly to senior programs",
  "Local Coachella Valley organization since 2019",
  "Bilingual English/Spanish services",
  "Transparent financial reporting",
  "Volunteer-driven with professional oversight",
];

export default async function HomePage() {
  const stats = await getPublicStats();

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(249,115,22,0.2),transparent_50%)]" />
        </div>
        <div className="relative container mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-sm px-4 py-1">
              501(c)(3) Nonprofit Organization
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              Compassionate Care for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                Seniors
              </span>{" "}
              in the Coachella Valley
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              InspireHope Senior Center provides essential services — transportation, housing support,
              wellness programs, and case management — to vulnerable seniors in Palm Desert and surrounding communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white h-14 px-8 text-lg">
                <Link href="/en/donate">
                  <Heart className="h-5 w-5 mr-2" />
                  Donate Now
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-14 px-8 text-lg">
                <Link href="/en/apply">
                  Request Assistance
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
                <div className="text-sm text-muted-foreground">Seniors Served</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6 text-center">
                <FolderOpen className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-slate-900">{stats.casesCount}</div>
                <div className="text-sm text-muted-foreground">Active Cases</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6 text-center">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-slate-900">
                  ${Math.round(stats.totalDonations).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Donations Received</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6 text-center">
                <Wallet className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-slate-900">
                  ${Math.round(stats.totalExpenses).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Invested in Programs</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground text-lg">
              Comprehensive support designed to help seniors live with dignity, independence, and hope.
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
      <section className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Serving the Coachella Valley Since 2019
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                InspireHope Senior Center of Coachella Valley (ISCCV) is a 501(c)(3) nonprofit organization
                based in Palm Desert, California. We believe every senior deserves to age with dignity,
                surrounded by community support and access to essential resources.
              </p>
              <p className="text-slate-300 text-lg leading-relaxed">
                Our bilingual team (English/Spanish) works directly with seniors and their families to navigate
                complex systems — from healthcare access and benefits enrollment to housing stability and transportation.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Badge variant="outline" className="border-white/30 text-white">
                  <Shield className="h-3 w-3 mr-1" />
                  EIN: 39-4484811
                </Badge>
                <Badge variant="outline" className="border-white/30 text-white">
                  Palm Desert, CA
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How You Can Help</h2>
            <p className="text-muted-foreground text-lg">
              Whether you give financially or need support yourself, there is a place for you at InspireHope.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold">Make a Donation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your contribution directly funds transportation, housing support, food programs,
                  and case management for seniors in need. Every dollar makes a difference.
                </p>
                <Button asChild className="bg-orange-500 hover:bg-orange-600">
                  <Link href="/en/donate">
                    Donate Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-slate-50">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <HandHeart className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold">Request Assistance</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If you or a loved one is a senior in the Coachella Valley facing housing instability,
                  transportation barriers, or other challenges, we are here to help.
                </p>
                <Button asChild variant="outline" className="border-blue-300 hover:bg-blue-50">
                  <Link href="/en/apply">
                    Apply for Services
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
            <h2 className="text-3xl font-bold">Contact Us</h2>
            <p className="text-muted-foreground">
              Have questions about our services, donations, or how to get involved? Reach out to our team.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 pt-4">
              <div className="flex flex-col items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-muted-foreground">73960 Highway 111 #4</span>
                <span className="text-sm text-muted-foreground">Palm Desert, CA 92260</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-muted-foreground">805-904-7882</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-muted-foreground">careisccv@gmail.com</span>
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
              <h4 className="text-white font-semibold text-lg mb-2">InspireHope Senior Center</h4>
              <p className="text-sm">
                Serving seniors in the Coachella Valley with compassion, dignity, and hope since 2019.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Quick Links</h4>
              <div className="flex flex-col gap-1 text-sm">
                <Link href="/en/donate" className="hover:text-white transition-colors">Donate</Link>
                <Link href="/en/apply" className="hover:text-white transition-colors">Apply for Services</Link>
                <Link href="/en/about" className="hover:text-white transition-colors">About Us</Link>
                <Link href="/en/contact" className="hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Legal</h4>
              <div className="flex flex-col gap-1 text-sm">
                <span>501(c)(3) Nonprofit</span>
                <span>EIN: 39-4484811</span>
                <span>NPI: 1184584765</span>
                <span>All donations are tax-deductible</span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-sm text-center">
            © {new Date().getFullYear()} InspireHope Senior Center of Coachella Valley. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
