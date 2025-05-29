import { defineAuth, secret } from '@aws-amplify/backend';
import { postConfirmation } from './post-confirmation/resource';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        scopes: [
          'https://www.googleapis.com/auth/userinfo.email', 
          'openid', 
          'https://www.googleapis.com/auth/userinfo.profile'
        ],
        attributeMapping: {
          email: 'email',
          fullname: 'name',
        }
      },
      callbackUrls: ["myapp://callback/"],
      logoutUrls: ["myapp://signout/"],
    }
  },
  triggers: {
    postConfirmation
  }
});
