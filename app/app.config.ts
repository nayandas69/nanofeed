// app.config.ts
// NanoFeed — App-level configuration
// These values are statically included in the build and accessible via useAppConfig()

export default defineAppConfig({
  // Application metadata
  app: {
    name: 'NanoFeed',
    description: 'A minimal, text-based developer micro social network.',
    version: '1.0.0',
    githubUrl: 'https://github.com/nayan-labs/nanofeed',
    organization: 'nayan-labs',
  },

  // Post constraints
  post: {
    maxLength: 280,
    minLength: 1,
  },

  // Feed settings
  feed: {
    pageSize: 20,
  },

  // UI settings
  ui: {
    // Sidebar width in px (desktop)
    sidebarWidth: 275,
  },
})
