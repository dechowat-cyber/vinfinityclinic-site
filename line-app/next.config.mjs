/** @type {import('next').NextConfig} */
export default {
  serverExternalPackages: ["@electric-sql/pglite"],
  poweredByHeader: false,
  // photos of the sales form uploaded on the finance page
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
  // the rich-menu image is read from disk by a server action on the settings page
  outputFileTracingIncludes: { "/staff/settings": ["./public/richmenu.jpg"], "/staff/**": ["./public/richmenu.jpg"] },
};
