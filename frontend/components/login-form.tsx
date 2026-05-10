import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Ubuntu } from "next/font/google"
import { getTranslations } from "next-intl/server"
import { LoginFormClient } from "@/components/auth/login-form-client"

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

export async function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = await getTranslations("LoginForm")
  return (
    <div className={cn("flex flex-col gap-6", ubuntu.className, className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginFormClient
            emailLabel={t("email")}
            emailPlaceholder={t("emailPlaceholder")}
            passwordLabel={t("password")}
            loginLabel={t("login")}
            dontHaveAnAccount={t("dontHaveAnAccount")}
            signUp={t("signUp")}
          />
        </CardContent>
      </Card>
    </div>
  )
}
