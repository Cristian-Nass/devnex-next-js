import { CheckIcon } from "lucide-react";
import { Ubuntu } from "next/font/google";
import { cn } from "@/lib/utils";   
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
const ubuntu = Ubuntu({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

const WebsiteProductsPage = () => {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        <h1 className={cn("text-4xl font-bold text-center mb-4 pt-28", ubuntu.className)}>Order Your Website/WebApplication</h1>
        <p className={cn("text-lg text-center mb-4 pb-12", ubuntu.className)} >We will help you create your website</p>
        <div className="flex flex-row gap-6 w-full">
            <div className="w-1/4 text-center p-4 rounded-lg border-1 border-cyan-600 flex flex-col justify-between">
                <h2 className={cn("text-2xl font-bold mb-4", ubuntu.className)}>Launch</h2>
                <ul className={cn("list-none text-left text-gray-800 space-y-1.5 h-full", ubuntu.className)}>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Customizable</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Editable</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Responsive</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />SEO Friendly</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Performance Optimized</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Security</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Support</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Updates</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Maintenance</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Email Support</li>
                </ul>
                <Button asChild className={cn("w-1/2 h-10 mx-auto mt-4", ubuntu.className)}>
                    <Link href="/products/create-website/launch">Order Now</Link>
                </Button>
            </div>
            <div className="w-1/4 text-center p-4 rounded-lg border-1 border-cyan-600 flex flex-col justify-between">
                <h2 className={cn("text-2xl font-bold mb-4", ubuntu.className)}>Growth</h2>
                <ul className={cn("list-none text-left text-gray-800 space-y-1.5 h-full", ubuntu.className)}>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Customizable</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Editable</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Responsive</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />SEO Friendly</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Performance Optimized</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Security</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Support</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Updates</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Maintenance</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Maintenance</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Email Support</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Analytics and Reporting</li>
                </ul>
                <Button asChild className={cn("w-1/2 h-10 mx-auto mt-4", ubuntu.className)}>
                    <Link href="/products/create-website/growth">Order Now</Link>
                </Button>

            </div>
            <div className="w-1/4 text-center p-4 rounded-lg border-1 border-cyan-600 flex flex-col justify-between">
                <h2 className={cn("text-2xl font-bold mb-4", ubuntu.className)}>Scale</h2>
                <ul className={cn("list-none text-left text-gray-800 space-y-1.5 h-full", ubuntu.className)}>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Customizable</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Editable</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Responsive</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />SEO Friendly</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Performance Optimized</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Security</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Support</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Updates</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Maintenance</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Maintenance</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Email Support</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Send SMS</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Pay Online</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Analytics and Reporting</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Booking System and Reporting</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Multiple Language Support</li>
                </ul>
                <Button asChild className={cn("w-1/2 h-10 mx-auto mt-4", ubuntu.className)}>
                    <Link href="/products/create-website/scale">Order Now</Link>
                </Button>

            </div>
            <div className="w-1/4 text-center p-4 rounded-lg border-1 border-cyan-600 flex flex-col justify-between">
                <h2 className={cn("text-2xl font-bold mb-4", ubuntu.className)}>Custom</h2>
                <ul className={cn("list-none text-left text-gray-800 space-y-1.5 h-full", ubuntu.className)}>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />Web Application / Mobile App</li>
                    <p className="text-gray-800">Create Web/Mobile Application for you, fully customizable for you and your needs</p>
                </ul>
                <Button asChild className={cn("w-1/2 h-10 mx-auto mt-4", ubuntu.className)}>
                    <Link href="/products/create-website/custom">Order Now</Link>
                </Button>

            </div>
        </div>
        </div>
    );
};

export default WebsiteProductsPage;