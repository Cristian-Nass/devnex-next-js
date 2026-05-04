import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { Ubuntu } from "next/font/google"
import { SignupFormClient } from "@/components/signup-form-client"

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

export async function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const t = await getTranslations("SignupForm")
  return (
    <Card {...props} className={cn(ubuntu.className)}>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupFormClient
          emailLabel={t("email")}
          emailPlaceholder={t("emailPlaceholder")}
          emailDescription={t("emailDescription")}
          passwordLabel={t("password")}
          passwordDescription={t("passwordDescription")}
          confirmPasswordLabel={t("confirmPassword")}
          confirmPasswordDescription={t("confirmPasswordDescription")}
          createAccountLabel={t("createAccount")}
          alreadyHaveAnAccount={t("alreadyHaveAnAccount")}
          signIn={t("signIn")}
        />
      </CardContent>
    </Card>
  )
}
