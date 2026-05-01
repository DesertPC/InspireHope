import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Heart, Users, MapPin, Calendar, Award } from "lucide-react";
import Link from "next/link";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.3),transparent_50%)]" />
        </div>
        <div className="relative container mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-sm px-4 py-1">
              501(c)(3) Nonprofit
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              About InspireHope
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              A beacon of hope for seniors in the Coachella Valley, providing compassionate care
              and essential services since 2026.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Our Story</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                InspireHope Senior Center of Coachella Valley (ISCCV) was founded in 2026 by a group of
                dedicated community members who recognized a growing need for senior support services
                in the desert region. What began as a small volunteer effort has grown into a
                comprehensive nonprofit organization serving hundreds of seniors each year.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Based in Palm Desert, California, we are deeply rooted in the Coachella Valley
                community. Our bilingual team works tirelessly to ensure that every senior —
                regardless of background or circumstance — has access to the resources and support
                they need to live with dignity and independence.
              </p>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Our Mission</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                To empower seniors in the Coachella Valley to age with dignity, security, and joy
                by providing comprehensive support services, advocacy, and community connection.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="border-0 shadow-sm bg-blue-50">
                  <CardContent className="pt-6">
                    <Heart className="h-6 w-6 text-blue-600 mb-3" />
                    <h3 className="font-semibold mb-1">Compassion</h3>
                    <p className="text-sm text-muted-foreground">Every senior deserves to be treated with kindness and respect.</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-orange-50">
                  <CardContent className="pt-6">
                    <Shield className="h-6 w-6 text-orange-600 mb-3" />
                    <h3 className="font-semibold mb-1">Advocacy</h3>
                    <p className="text-sm text-muted-foreground">We fight for the rights and needs of vulnerable seniors.</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-green-50">
                  <CardContent className="pt-6">
                    <Users className="h-6 w-6 text-green-600 mb-3" />
                    <h3 className="font-semibold mb-1">Community</h3>
                    <p className="text-sm text-muted-foreground">Building connections that reduce isolation and improve lives.</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-purple-50">
                  <CardContent className="pt-6">
                    <Award className="h-6 w-6 text-purple-600 mb-3" />
                    <h3 className="font-semibold mb-1">Excellence</h3>
                    <p className="text-sm text-muted-foreground">Committed to the highest standards of service and care.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold">Credentials & Transparency</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6 text-center">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold">501(c)(3)</div>
                  <div className="text-sm text-muted-foreground">Tax-exempt nonprofit</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6 text-center">
                  <Badge variant="outline" className="text-lg px-3 py-1 mb-3">EIN</Badge>
                  <div className="text-2xl font-bold">39-4484811</div>
                  <div className="text-sm text-muted-foreground">IRS Employer ID</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6 text-center">
                  <Badge variant="outline" className="text-lg px-3 py-1 mb-3">NPI</Badge>
                  <div className="text-2xl font-bold">1184584765</div>
                  <div className="text-sm text-muted-foreground">National Provider ID</div>
                </CardContent>
              </Card>
            </div>
            <p className="text-muted-foreground">
              All donations are tax-deductible. We maintain transparent financial records and
              are committed to accountability in everything we do.
            </p>
          </div>
        </div>
      </section>

      {/* Team / Leadership */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Leadership</h2>
            <p className="text-muted-foreground text-lg">
              Guided by experienced professionals with deep roots in the Coachella Valley community.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-0 shadow-sm text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg">Board of Directors</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Community leaders, healthcare professionals, and advocates dedicated to senior welfare.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-lg">Case Management Team</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Licensed social workers and care coordinators providing personalized support.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">Volunteer Network</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Over 50 active volunteers providing transportation, companionship, and event support.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Our Location</h2>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span>73960 Highway 111 #4, Palm Desert, CA 92260</span>
            </div>
            <p className="text-muted-foreground">
              Conveniently located in the heart of Palm Desert to serve seniors across the
              Coachella Valley including Palm Springs, Indian Wells, La Quinta, Indio, and Coachella.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
