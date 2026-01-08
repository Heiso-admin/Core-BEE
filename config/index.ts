const config = {
  site: {
    name: "Core-Bee",
    title: "Core-Bee",
    base_url: "/",
    favicon: "/assets/svg/favicon.svg",
    slogan: "Core-Bee",
    description: "Core-Bee",
    organization: "Heiso",
    logo: {
      url: "/images/logo.png",
      title: "Core-Bee",
    },
    ogImage: "/assets/svg/og-image.svg",
    domain: "sunlife.heiso.io",
    copyright: "© 2024 Heiso. All rights reserved.",
  },

  settings: {
    pagination: 3,
    summary_length: 200,
    blog_folder: "content/blog",
  },

  params: {
    tag_manager_id: "",
    contact_form_action: "#",
    copyright: "Copyright ©Heiso 2024 a theme by codists",
  },

  metadata: {
    meta_author: "jun wang",
    meta_image: "/assets/svg/og-image.svg",
    meta_description: "an pai",
  },

  auth: {
    account: {
      base_url: "/account",

      menu: [
        {
          name: "My Account",
          items: [
            {
              name: "General",
              meta: {
                url: "/preferences",
                icon: "UserPen",
                title: "Account Settings",
              },
            },
            {
              name: "Authentication",
              meta: {
                url: "/authentication",
                icon: "Key",
                title: "Authentication",
              },
            },
          ],
        },
      ],
    },
  },
};

export * from "./settings";

export default config;
