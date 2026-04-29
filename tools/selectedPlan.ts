export const selectedPlan = (plan: string) => {

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


const launchPlan = {
    name: "Launch",
    description:
        "Perfect for startups, freelancers, and local businesses that need a strong online presence quickly. This plan is ideal when you want a clean, professional website to present your services and start getting leads.",
    features: {
        customizable: "The website can be tailored to your brand and needs (colors, layout, sections, features, content style).",
        editable: "You can easily update text, images, and key content later without rebuilding the whole site.",
        performanceOptimized: "The site is built to load fast and run smoothly (optimized images/code, good Core Web Vitals, better user experience and SEO).",
        maintenance: "Ongoing support after launch to keep the site healthy (updates, bug fixes, monitoring, backups, minor improvements).",
    }
    }

const growthPlan = {
    name: "Growth",
    description:
        "Designed for small to mid-size companies that are already operating and want to generate more traffic and conversions. A great fit for businesses that need deeper content, stronger SEO, and better marketing performance.",
    features: {
        customizable: "The website can be tailored to your brand and needs (colors, layout, sections, features, content style).",
        editable: "You can easily update text, images, and key content later without rebuilding the whole site.",
        performanceOptimized: "The site is built to load fast and run smoothly (optimized images/code, good Core Web Vitals, better user experience and SEO).",
        maintenance: "Ongoing support after launch to keep the site healthy (updates, bug fixes, monitoring, backups, minor improvements).",
    }
}

const scalePlan = {
    name: "Scale",
    description:
        "Built for growing companies with higher traffic and more complex business needs. Best for teams that need advanced features, integrations, analytics, and multilingual support to scale operations and reach wider markets.",
    features: {
        customizable: "The website can be tailored to your brand and needs (colors, layout, sections, features, content style).",
        editable: "You can easily update text, images, and key content later without rebuilding the whole site.",
        responsive: "The website is responsive and works on all devices.",
        "SEO Friendly": "The website is SEO friendly and easy to index by search engines.",     
        performanceOptimized: "The site is built to load fast and run smoothly (optimized images/code, good Core Web Vitals, better user experience and SEO).",
        security: "The website is secure and protected from attacks.",
        support: "Ongoing support after launch to keep the site healthy (updates, bug fixes, monitoring, backups, minor improvements).",
        updates: "The website is updated regularly to keep it secure and functional.",
        maintenance: "Ongoing support after launch to keep the site healthy (updates, bug fixes, monitoring, backups, minor improvements).",
        emailSupport: "Email support to help you with any questions or issues.",
        sendSMS: "Send SMS to your customers to notify them of new updates or promotions.",
        payOnline: "Pay online for your services or products.",
        analyticsAndReporting: "Analytics and reporting to help you track your website's performance.",
        bookingSystemAndReporting: "Booking system and reporting to help you manage your bookings and appointments.",
        multipleLanguageSupport: "Multiple language support to help you reach a global audience.",
    }
}

const customPlan = {

    name: "Custom",
    description:
        "Best for established companies with unique workflows that require a tailored solution. Choose this plan when you need a custom web application or mobile app built around your exact processes, systems, and long-term goals.",
    features: {
        webApplication: "The website can be tailored to your brand and needs (colors, layout, sections, features, content style).",
        mobileApplication: "You can easily update text, images, and key content later without rebuilding the whole site.",
        performanceOptimized: "The site is built to load fast and run smoothly (optimized images/code, good Core Web Vitals, better user experience and SEO).",
        maintenance: "Ongoing support after launch to keep the site healthy (updates, bug fixes, monitoring, backups, minor improvements).",
    }
}