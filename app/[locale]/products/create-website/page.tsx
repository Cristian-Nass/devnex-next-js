import { CheckIcon } from "lucide-react";
import { Ubuntu } from "next/font/google";
import { cn } from "@/lib/utils";   
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
const ubuntu = Ubuntu({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

const WebsiteProductsPage = async () => {
    const t = await getTranslations("CreateWebsiteLanding");
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        <h1 className={cn("text-4xl font-bold text-center mb-4 pt-28", ubuntu.className)}>{t("title")}</h1>
        <p className={cn("text-lg text-center mb-4 pb-12", ubuntu.className)}>{t("subtitle")}</p>
        <div className="flex flex-row gap-6 w-full">
            <div className="w-1/4 text-center p-4 rounded-lg border-1 border-cyan-600 flex flex-col justify-between">
                <h2 className={cn("text-2xl font-bold mb-4", ubuntu.className)}>{t("plans.launch.name")}</h2>
                <ul className={cn("list-none text-left text-gray-800 space-y-1.5 h-full", ubuntu.className)}>
                    {["customizable", "editable", "responsive", "seoFriendly", "performanceOptimized", "security", "support", "updates", "emailSupport"].map((feature) => (
                        <li key={feature} className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />{t(`features.${feature}`)}</li>
                    ))}
                </ul>
                <Button asChild className={cn("w-1/2 h-10 mx-auto mt-4", ubuntu.className)}>
                    <Link href="/products/create-website/launch">{t("orderNow")}</Link>
                </Button>
            </div>
            <div className="w-1/4 text-center p-4 rounded-lg border-1 border-cyan-600 flex flex-col justify-between">
                <h2 className={cn("text-2xl font-bold mb-4", ubuntu.className)}>{t("plans.growth.name")}</h2>
                <ul className={cn("list-none text-left text-gray-800 space-y-1.5 h-full", ubuntu.className)}>
                    {["customizable", "editable", "responsive", "seoFriendly", "performanceOptimized", "security", "support", "updates", "maintenance", "emailSupport", "analyticsAndReporting"].map((feature) => (
                        <li key={feature} className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />{t(`features.${feature}`)}</li>
                    ))}
                </ul>
                <Button asChild className={cn("w-1/2 h-10 mx-auto mt-4", ubuntu.className)}>
                    <Link href="/products/create-website/growth">{t("orderNow")}</Link>
                </Button>

            </div>
            <div className="w-1/4 text-center p-4 rounded-lg border-1 border-cyan-600 flex flex-col justify-between">
                <h2 className={cn("text-2xl font-bold mb-4", ubuntu.className)}>{t("plans.scale.name")}</h2>
                <ul className={cn("list-none text-left text-gray-800 space-y-1.5 h-full", ubuntu.className)}>
                    {["customizable", "editable", "responsive", "seoFriendly", "performanceOptimized", "security", "support", "updates", "maintenance", "emailSupport", "sendSms", "payOnline", "analyticsAndReporting", "bookingSystemAndReporting", "multipleLanguageSupport"].map((feature) => (
                        <li key={feature} className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />{t(`features.${feature}`)}</li>
                    ))}
                </ul>
                <Button asChild className={cn("w-1/2 h-10 mx-auto mt-4", ubuntu.className)}>
                    <Link href="/products/create-website/scale">{t("orderNow")}</Link>
                </Button>

            </div>
            <div className="w-1/4 text-center p-4 rounded-lg border-1 border-cyan-600 flex flex-col justify-between">
                <h2 className={cn("text-2xl font-bold mb-4", ubuntu.className)}>{t("plans.custom.name")}</h2>
                <ul className={cn("list-none text-left text-gray-800 space-y-1.5 h-full", ubuntu.className)}>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4" />{t("features.webApplicationMobile")}</li>
                    <p className="text-gray-800">{t("plans.custom.description")}</p>
                </ul>
                <Button asChild className={cn("w-1/2 h-10 mx-auto mt-4", ubuntu.className)}>
                    <Link href="/products/create-website/custom">{t("orderNow")}</Link>
                </Button>

            </div>
        </div>
        </div>
    );
};

export default WebsiteProductsPage;