import { Navigation } from "@/components/navigation";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Portfolio } from "@/components/portfolio";
import { PhotoGallery } from "@/components/photo-gallery";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export default function HomePage(){
  return <><Navigation /><main id="main-content"><Hero /><About /><Portfolio><PhotoGallery /><Contact /><Footer /></Portfolio></main></>;
}
