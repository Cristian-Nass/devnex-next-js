'use client';

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ClickToLink({ href, children }: { href: string, children: React.ReactNode }) {
    const router = useRouter();
    return (
        <Button variant="default" className="cursor-pointer hover:bg-primary/90 bg-zinc-800 h-10 w-fit mx-auto" size="lg" asChild>
            <Link href={href} prefetch={false}>
                {children}
            </Link>
        </Button>
    );
}