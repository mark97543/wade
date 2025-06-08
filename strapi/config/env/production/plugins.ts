// path: strapi/app/config/env/production/plugins.ts
export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env('AWS_ACCESS_SECRET'),
        region: env('AWS_REGION'), // e.g., 'us-east-1'
        params: {
          Bucket: env('AWS_BUCKET_NAME'), // Use a different variable name to avoid conflicts
        },
        endpoint: env('AWS_ENDPOINT'), // e.g. 'sfo3.digitaloceanspaces.com'
      },
    },
  },
});
