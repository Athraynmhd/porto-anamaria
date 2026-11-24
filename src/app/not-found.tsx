import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound(){return <main id="main-content" className="not-found"><span>404</span><h1>Halaman tidak ditemukan</h1><p>Kembali untuk melihat karya dan cerita lainnya.</p><Button asChild><Link href="/">Kembali ke Home</Link></Button></main>;}
