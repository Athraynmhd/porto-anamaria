import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { ProjectDetail } from "@/components/project-detail";

// New projects added in /admin render on first visit; unknown slugs 404.
export async function generateStaticParams(){const {projects}=await getContent();return projects.map(({slug})=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;const {projects}=await getContent();const project=projects.find(p=>p.slug===slug);
  return {title:project?.title??"Project",description:project?.description.slice(0,155)};
}
export default async function ProjectPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const {projects}=await getContent();const project=projects.find(p=>p.slug===slug);
  if(!project)notFound();
  return <ProjectDetail project={project}/>;
}
