import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { Ubuntu } from "next/font/google"
import { Link } from "@/i18n/routing";

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
        <CardDescription>
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">{t("name")}</FieldLabel>
              <Input id="name" type="text" placeholder="John Doe" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                required
              />
              <FieldDescription>
                {t("emailDescription")}
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
              <Input id="password" type="password" required />
              <FieldDescription>
                {t("passwordDescription")}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                {t("confirmPassword")}
              </FieldLabel>
              <Input id="confirm-password" type="password" required />
              <FieldDescription>{t("confirmPasswordDescription")}</FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                    <Button type="submit">{t("createAccount")}</Button>
                <Button variant="outline" type="button">
                  {t("signUpWithGoogle")}
                </Button>
                <FieldDescription className="px-6 text-center">
                  {t("alreadyHaveAnAccount")} <Link href={`login`}>{t("signIn")}</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
