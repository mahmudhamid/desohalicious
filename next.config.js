const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer({
  poweredByHeader: false,
  target: 'serverless',
  generateEtags: false,
  devIndicators: {
    autoPrerender: false,
  },
  images: {
    domains: ['nitron-dashboard04330-prod.s3.eu-west-1.amazonaws.com'],
  },
  future: {
    webpack5: true
  }
})