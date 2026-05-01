import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_50%)]" />
        </div>
        <div className="relative container mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-sm px-4 py-1">
              Get in Touch
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Have questions about our services, want to volunteer, or need assistance?
              We are here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Details */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Reach Out</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Our team is available Monday through Friday to answer your questions,
                  schedule appointments, and provide information about our programs.
                </p>
              </div>

              <div className="space-y-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Office Address</h3>
                      <p className="text-muted-foreground">73960 Highway 111 #4</p>
                      <p className="text-muted-foreground">Palm Desert, CA 92260</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Phone</h3>
                      <p className="text-muted-foreground">805-904-7882</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <p className="text-muted-foreground">careisccv@gmail.com</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Office Hours</h3>
                      <p className="text-muted-foreground">Monday – Friday: 8:00 AM – 5:00 PM</p>
                      <p className="text-muted-foreground">Saturday: 9:00 AM – 1:00 PM</p>
                      <p className="text-muted-foreground">Sunday: Closed</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" action="mailto:careisccv@gmail.com" method="post" encType="text/plain">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="Jane" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="jane@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" placeholder="(760) 555-0100" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="How can we help?" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        rows={4}
                        placeholder="Please describe your question or request..."
                      />
                    </div>
                    <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                      Send Message
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      This form sends an email to our team. For urgent matters, please call us directly.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Service Area</h2>
            <p className="text-muted-foreground text-lg">
              We proudly serve seniors throughout the Coachella Valley, including:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Palm Desert",
                "Palm Springs",
                "Indian Wells",
                "La Quinta",
                "Rancho Mirage",
                "Indio",
                "Coachella",
                "Cathedral City",
                "Desert Hot Springs",
                "Thousand Palms",
              ].map((city) => (
                <Badge key={city} variant="outline" className="px-3 py-1 text-sm">
                  {city}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
