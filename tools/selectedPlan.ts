export type PlanContent = {
  nameKey: string;
  descriptionKeys: string[];
  featureKeys: string[];
};

const launchPlan: PlanContent = {
  nameKey: "CreateWebsitePlans.launch.name",
  descriptionKeys: [
    "CreateWebsitePlans.launch.description.0",
    "CreateWebsitePlans.launch.description.1",
  ],
  featureKeys: [
    "CreateWebsitePlans.features.customizable",
    "CreateWebsitePlans.features.editable",
    "CreateWebsitePlans.features.performanceOptimized",
    "CreateWebsitePlans.features.maintenance",
  ],
};

const growthPlan: PlanContent = {
  nameKey: "CreateWebsitePlans.growth.name",
  descriptionKeys: [
    "CreateWebsitePlans.growth.description.0",
    "CreateWebsitePlans.growth.description.1",
  ],
  featureKeys: [
    "CreateWebsitePlans.features.customizable",
    "CreateWebsitePlans.features.editable",
    "CreateWebsitePlans.features.performanceOptimized",
    "CreateWebsitePlans.features.maintenance",
    "CreateWebsitePlans.features.emailSupport",
    "CreateWebsitePlans.features.analyticsAndReporting",
  ],
};

const scalePlan: PlanContent = {
  nameKey: "CreateWebsitePlans.scale.name",
  descriptionKeys: [
    "CreateWebsitePlans.scale.description.0",
    "CreateWebsitePlans.scale.description.1",
  ],
  featureKeys: [
    "CreateWebsitePlans.features.customizable",
    "CreateWebsitePlans.features.editable",
    "CreateWebsitePlans.features.responsive",
    "CreateWebsitePlans.features.seoFriendly",
    "CreateWebsitePlans.features.performanceOptimized",
    "CreateWebsitePlans.features.security",
    "CreateWebsitePlans.features.support",
    "CreateWebsitePlans.features.updates",
    "CreateWebsitePlans.features.maintenance",
    "CreateWebsitePlans.features.emailSupport",
    "CreateWebsitePlans.features.sendSms",
    "CreateWebsitePlans.features.payOnline",
    "CreateWebsitePlans.features.analyticsAndReporting",
    "CreateWebsitePlans.features.bookingSystemAndReporting",
    "CreateWebsitePlans.features.multipleLanguageSupport",
    "CreateWebsitePlans.features.RegistrationAndLogin",
  ],
};

const customPlan: PlanContent = {
  nameKey: "CreateWebsitePlans.custom.name",
  descriptionKeys: [
    "CreateWebsitePlans.custom.description.0",
    "CreateWebsitePlans.custom.description.1",
  ],
  featureKeys: [
    "CreateWebsitePlans.features.webApplication",
    "CreateWebsitePlans.features.mobileApplication",
    "CreateWebsitePlans.features.performanceOptimized",
    "CreateWebsitePlans.features.maintenance",
  ],
};

export const selectedPlan = (plan: string): PlanContent => {
  switch (plan) {
    case "launch":
      return launchPlan;
    case "growth":
      return growthPlan;
    case "scale":
      return scalePlan;
    case "custom":
      return customPlan;
    default:
      return launchPlan;
  }
};