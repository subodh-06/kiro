import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, LayoutDashboard, Zap, ShieldCheck, CheckCircle2 } from "lucide-react";
import { auth } from "@clerk/nextjs/server"; // 🚀 1. Import Clerk's server auth

export default async function HomePage() {
  // 🚀 2. Check if the user is signed in and get their org info
  const { userId, orgSlug } = await auth();
  
  // Smart routing: if they have an org, go to dashboard. If not, go to onboarding.
  const dashboardUrl = orgSlug ? `/organization/${orgSlug}` : "/onboarding";

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/10">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">Kiro</span>
          </div>
          <nav className="flex items-center gap-4">
            {/* 🚀 3. Conditionally render the buttons based on auth status */}
            {userId ? (
              <Button asChild size="sm">
                <Link href={dashboardUrl}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Button asChild size="sm">
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-24 pb-32 md:px-8 md:pt-32 md:pb-40 text-center">
          <div className="mx-auto max-w-[800px] space-y-8">
            <div className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              The Open-Source Jira Alternative
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Project management with a <span className="text-primary">0 learning curve.</span>
            </h1>
            
            <p className="mx-auto max-w-[600px] text-lg text-muted-foreground sm:text-xl leading-relaxed">
              Built exclusively for MSMEs and early-stage startups. Ditch the bloated workflows and endless configuration of Jira and Asana. Start planning sprints and shipping features in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="w-full sm:w-auto font-semibold h-12 px-8">
                <Link href={userId ? dashboardUrl : "/sign-up"}>
                  {userId ? "Go to Dashboard" : "Start Building Free"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8">
                <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" /> Star on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="border-t bg-muted/30 py-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why teams are making the switch</h2>
              <p className="mt-4 text-lg text-muted-foreground">Everything you need to ship product, without the enterprise bloat.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-2xl border shadow-sm">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Zero Onboarding</h3>
                <p className="text-muted-foreground leading-relaxed">
                  No 10-step tutorials or certifications required. If you know how to drag and drop a card, you already know how to use it.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-2xl border shadow-sm">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Tailored for Startups</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Perfect for lean MSMEs. We stripped away the convoluted enterprise permission settings so your team can just focus on the work.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-2xl border shadow-sm">
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">100% Open Source</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Own your data. Self-host it on your own infrastructure for maximum security, or use our managed cloud to get started instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">Ready to regain your team&apos;s velocity?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join the growing community of founders and builders who have left traditional, bloated project management behind.
            </p>
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href={userId ? dashboardUrl : "/sign-up"}>
                {userId ? "Go to Dashboard" : "Create Your First Workspace"}
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-8">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Kiro. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="https://github.com" className="hover:text-foreground transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}