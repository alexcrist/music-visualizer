const getEnvironment = () => {
  const env = process.env.NODE_ENV || 'development';
  
  const environments = {
    development: {
      port: 3000,
      apiBase: 'http://localhost:3000',
      frontendUrl: 'http://localhost:5173'
    },
    production: {
      port: process.env.PORT || 3000,
      apiBase: process.env.API_BASE || 'https://your-production-api.com',
      frontendUrl: process.env.FRONTEND_URL || 'https://your-production-frontend.com'
    }
  };

  return environments[env] || environments.development;
};

export const config = getEnvironment();