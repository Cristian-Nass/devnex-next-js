export const selectedPlan = (plan: string) => {

    switch (plan) {
        case "plan-a":
            return planA;
        case "plan-b":
            return planB;
        case "plan-c":
            return planC;
        case "plan-d":
            return planD;
        default:
            return planA;
    }
};


const planA = {
    name: "Plan A",
    description: "Plan A description",
    features: {
        customizable: "The website can be tailored to your brand and needs (colors, layout, sections, features, content style).",
        editable: "You can easily update text, images, and key content later without rebuilding the whole site.",
        performanceOptimized: "The site is built to load fast and run smoothly (optimized images/code, good Core Web Vitals, better user experience and SEO).",
        maintenance: "Ongoing support after launch to keep the site healthy (updates, bug fixes, monitoring, backups, minor improvements).",
    }
    }

const planB = {
    name: "Plan B",
    description: "Plan B description",
    features: {
        customizable: "The website can be tailored to your brand and needs (colors, layout, sections, features, content style).",
        editable: "You can easily update text, images, and key content later without rebuilding the whole site.",
        performanceOptimized: "The site is built to load fast and run smoothly (optimized images/code, good Core Web Vitals, better user experience and SEO).",
        maintenance: "Ongoing support after launch to keep the site healthy (updates, bug fixes, monitoring, backups, minor improvements).",
    }
}

const planC = {
    name: "Plan C",
    description: "Plan C description",
    features: {
        customizable: "The website can be tailored to your brand and needs (colors, layout, sections, features, content style).",
        editable: "You can easily update text, images, and key content later without rebuilding the whole site.",
        performanceOptimized: "The site is built to load fast and run smoothly (optimized images/code, good Core Web Vitals, better user experience and SEO).",
        maintenance: "Ongoing support after launch to keep the site healthy (updates, bug fixes, monitoring, backups, minor improvements).",
    }
}

const planD = {

    name: "Plan D",
    description: "Plan D description",
    features: {
        webApplication: "The website can be tailored to your brand and needs (colors, layout, sections, features, content style).",
        mobileApplication: "You can easily update text, images, and key content later without rebuilding the whole site.",
        performanceOptimized: "The site is built to load fast and run smoothly (optimized images/code, good Core Web Vitals, better user experience and SEO).",
        maintenance: "Ongoing support after launch to keep the site healthy (updates, bug fixes, monitoring, backups, minor improvements).",
    }
}