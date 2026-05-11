import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/** Post-registration: no token in URL — user must open the link from email. */
export default async function VerifyEmailPage() {
  const t = await getTranslations("VerifyEmailSent");

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">{t("checkSpam")}</p>
          <Button asChild>
            <Link href="/login">{t("backToLogin")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
