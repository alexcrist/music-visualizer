const getEnvironment = () => {
  const env = import.meta.env.MODE || 'development';
  
  const environments = {
    development: {
      apiBase: 'http://localhost:3000'
    },
    production: {
      apiBase: 'https://your-production-api.com' // Update this with your actual production API URL
    }
  };

  return environments[env] || environments.development;
};

export const config = getEnvironment();