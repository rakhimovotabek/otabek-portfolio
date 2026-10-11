import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { ProjectIndex } from "@/components/sections/project-index";
import { SideQuests } from "@/components/sections/side-quests";
import { Achievements } from "@/components/sections/achievements";
import { Guestbook } from "@/components/sections/guestbook";
import { ContactLauncher } from "@/components/contact/contact-launcher";
import { PageMotion } from "@/components/motion/page-motion";
export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <PageMotion>
        <Navigation />
        <main id="main" tabIndex={-1}>
          <Hero />
          <About />
          <ProjectIndex />
          <SideQuests />
          <Achievements />
          <Guestbook />
        </main>
        <Footer />
        <ContactLauncher />
      </PageMotion>
    </>
  );
}
