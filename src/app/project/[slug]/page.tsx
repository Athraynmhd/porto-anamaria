import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/data/portfolio";
import { ProjectDetail } from "@/components/project-detail";
export const dynamicParams=false;
export function generateStaticParams(){return projects.map(({slug})=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const project=projects.find(p=>p.slug===slug);return {title:project?.title??"Project",description:project?.description.slice(0,155)};}
export default async function ProjectPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const project=projects.find(p=>p.slug===slug);if(!project)notFound();return <ProjectDetail project={project}/>;}
