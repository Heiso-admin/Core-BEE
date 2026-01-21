export const CMS_DEFAULT_MENUS = {
  faq: [
    {
      group: "functions",
      items: [
        {
          name: "Faq",
          meta: {
            url: "/faq",
            icon: "message-circle-question",
            title: "Faq",
          },
        }
      ]
    }
  ],
  homePage: [
    {
      group: "functions",
      items: [
        {
          name: "HomePage",
          meta: {
            url: "/homepage",
            icon: "app-window-mac",
            title: "HomePage",
          },
        }
      ]
    }
  ],
  navigation: [
    {
      group: "functions",
      items: [
        {
          name: "Navigation",
          meta: {
            url: "/navigation",
            icon: "map",
            title: "Navigation",
          },
        },
      ],
    },
  ],
  page: [
    {
      group: "functions",
      items: [
        {
          name: "Page",
          meta: {
            url: "/pages",
            icon: "album",
            title: "Page",
          },
        },
      ],
    },
  ],
  role: [
    {
      group: "membership",
      items: [
        {
          name: "Role",
          meta: {
            url: "/role",
            icon: "square-user-round",
            title: "Role",
          },
        },
      ],
    },
  ],
  site_seo: [
    {
      group: "functions",
      items: [
        {
          name: "Site-SEO",
          meta: {
            url: "/settings/site",
            icon: "settings",
            title: "Site-SEO",
          },
        },
      ],
    },
  ],
  team: [
    {
      group: "membership",
      items: [
        {
          name: "Team",
          meta: {
            url: "/team",
            icon: "users-round",
            title: "Team",
          },
        },
      ],
    },
  ],
};

export const DEFAULT_ROLES = [
  {
    name: "Admin",
    description: "Administrator with high privileges",
    fullAccess: true,
  },
  {
    name: "Editor",
    description: "",
    fullAccess: true,
  }
];
