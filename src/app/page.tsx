import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { ProjectIndex } from "@/components/sections/project-index";
import { ContactLauncher } from "@/components/contact/contact-launcher";
export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div id="top">
        <Navigation />
        <main id="main">
          <Hero />
          <About />
          <ProjectIndex />
        </main>
        <Footer />
        <ContactLauncher />
      </div>
    </>
  );
}
