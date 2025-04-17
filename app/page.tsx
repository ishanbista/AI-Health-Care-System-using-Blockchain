import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AnimatedButton } from "@/components/ui/animated-button"
import { FeatureCard } from "@/components/ui/feature-card"
import { GradientText } from "@/components/ui/gradient-text"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SquareImage } from "@/components/square-image"
import { Brain, Shield, Activity, ArrowRight, Stethoscope, Users, Lock, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative bg-background overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
            <div className="absolute right-0 top-0 h-full w-1/2">
              <svg
                className="h-full w-full text-primary"
                fill="currentColor"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polygon points="0,0 100,0 100,100" opacity="0.1" />
              </svg>
            </div>
          </div>
          <div className="relative container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-heading tracking-tight text-foreground">
                  TeleHealth: <GradientText variant="blue" size="3xl">Connect</GradientText> with the Right Doctor Using{" "}
                  <GradientText variant="green" size="3xl">AI + Blockchain</GradientText>
                </h1>
                <p className="mt-8 text-xl md:text-2xl text-foreground/80 max-w-3xl leading-relaxed">
                  Our platform uses AI to analyze your symptoms and match you with the perfect specialist. All your medical data is secured with blockchain technology for complete privacy and transparency.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link href="/connect-wallet">
                    <AnimatedButton
                      size="lg"
                      variant="primary"
                      icon={<ArrowRight className="h-5 w-5" />}
                      iconPosition="right"
                      className="font-medium"
                    >
                      Connect Wallet
                    </AnimatedButton>
                  </Link>
                  <Link href="#how-it-works">
                    <AnimatedButton
                      size="lg"
                      variant="outline"
                      icon={<ArrowRight className="h-5 w-5" />}
                      iconPosition="right"
                      className="border-primary text-primary hover:bg-primary/10 font-medium"
                    >
                      Learn More
                    </AnimatedButton>
                  </Link>
                </div>
              </div>
              <SquareImage
                src="2.jpg?v=2"
                alt="TeleHealth"
                className="w-full max-w-md mx-auto lg:max-w-none"
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-muted/50" id="how-it-works">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                How <GradientText variant="blue" size="2xl">TeleHealth</GradientText> Works
              </h2>
              <p className="mt-4 text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
                Our platform combines AI and blockchain technology to create a seamless healthcare experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                variant="primary"
                title="AI Symptom Analysis"
                description="Enter your symptoms and our AI will analyze them to match you with the most suitable specialists."
                icon={<Brain className="h-8 w-8" />}
              />

              <FeatureCard
                variant="secondary"
                title="Blockchain Security"
                description="All your medical data and consultation requests are securely stored on the blockchain."
                icon={<Shield className="h-8 w-8" />}
              />

              <FeatureCard
                variant="primary"
                title="Remote Consultations"
                description="Connect with doctors through secure video calls and receive treatment recommendations."
                icon={<Activity className="h-8 w-8" />}
              />

              <FeatureCard
                variant="secondary"
                title="Smart Matching"
                description="Our AI ensures you're connected with specialists who have the right expertise for your condition."
                icon={<Zap className="h-8 w-8" />}
              />
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-background" id="benefits">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                <GradientText variant="green" size="2xl">Benefits</GradientText> for Everyone
              </h2>
              <p className="mt-4 text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
                TeleHealth offers numerous advantages for both patients and healthcare providers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-card p-8 rounded-xl shadow-md border border-border/50 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold font-heading text-primary">For Patients</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                      <ArrowRight className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-muted-foreground">Access to specialists matched to your specific symptoms</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                      <ArrowRight className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-muted-foreground">Secure storage of all your medical data on blockchain</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                      <ArrowRight className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-muted-foreground">Convenient remote consultations from anywhere</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                      <ArrowRight className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-muted-foreground">Reduced wait times and faster access to care</p>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-8 rounded-xl shadow-md border border-border/50 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mr-4">
                    <Stethoscope className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-semibold font-heading text-secondary">For Doctors</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center mr-3 mt-0.5">
                      <ArrowRight className="h-3 w-3 text-secondary" />
                    </div>
                    <p className="text-muted-foreground">Pre-screened patients matched to your specialty</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center mr-3 mt-0.5">
                      <ArrowRight className="h-3 w-3 text-secondary" />
                    </div>
                    <p className="text-muted-foreground">Secure access to patient medical history</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center mr-3 mt-0.5">
                      <ArrowRight className="h-3 w-3 text-secondary" />
                    </div>
                    <p className="text-muted-foreground">Flexible scheduling for remote consultations</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center mr-3 mt-0.5">
                      <ArrowRight className="h-3 w-3 text-secondary" />
                    </div>
                    <p className="text-muted-foreground">Blockchain verification of all consultations</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
