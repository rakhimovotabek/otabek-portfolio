import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { ProjectIndex } from "@/components/sections/project-index";
import { Lately } from "@/components/universe/lately";
export default function Home() {
  return (
    <>
      <Hero />
      <About compact />
      <ProjectIndex featured />
      <Lately />
    </>
  );
}
