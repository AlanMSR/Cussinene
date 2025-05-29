import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { IgnoreMode } from 'aws-cdk-lib';
import { IdentitySource } from 'aws-cdk-lib/aws-apigateway';
import { AllAtOnceTrafficRouting } from 'aws-cdk-lib/aws-codedeploy';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { postConfirmation } from '../auth/post-confirmation/resource';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/
// export const FoodAllergyValues = [
//   'DAIRY', 'EGGS', 'FISH', 'SHELLFISH', 'TREE_NUTS',
//   'PEANUTS', 'WHEAT', 'SOY', 'GLUTEN', 'OTHER'
// ] as const;

// export const DietaryPreferenceValues = [
//   'VEGETARIAN', 'VEGAN', 'PESCATARIAN', 'KETO', 'PALEO',
//   'LOW_CARB', 'LOW_FAT', 'DAIRY_FREE', 'GLUTEN_FREE',
//   'HALAL', 'KOSHER', 'OTHER'
// ] as const;

// export const MealTypeValues = ['BREAKFAST', 'LUNCH', 'DINNER'] as const;

// export const UnitTypeValues = [
//   'GRAMS', 'MILLILITERS', 'CUPS', 'TABLESPOONS', 'TEASPOONS', 'PIECES'
// ] as const;

const schema = a.schema({
  // FoodAllergy: a.enum([
  //   'DAIRY', 'EGGS', 'FISH', 'SHELLFISH', 'TREE_NUTS',
  //   'PEANUTS', 'WHEAT', 'SOY', 'GLUTEN', 'OTHER'
  // ]),

  // DietaryPreference: a.enum([
  //   'VEGETARIAN', 'VEGAN', 'PESCATARIAN', 'KETO', 'PALEO',
  //   'LOW_CARB', 'LOW_FAT', 'DAIRY_FREE', 'GLUTEN_FREE',
  //   'HALAL', 'KOSHER', 'OTHER'
  // ]),

  // MealType: a.enum(['BREAKFAST', 'LUNCH', 'DINNER']),

  UnitType: a.enum([
    // Weight
    'GRAMS',          // g
    'KILOGRAMS',      // kg
    'OUNCES',         // oz
    'POUNDS',         // lbs
  
    // Volume (Liquids)
    'MILLILITERS',    // ml
    'LITERS',         // L
    'FLUID_OUNCES',   // fl oz
    'CUPS',           // cups (metric/US)
    'TABLESPOONS',    // tbsp (~15ml)
    'TEASPOONS',      // tsp (~5ml)
    'PINTS',          // pt (US/UK)
    'QUARTS',         // qt
    'GALLONS',        // gal
  
    // Count/Discrete
    'PIECES',         // pcs
    'SLICES',         // slices (e.g., bread)
    'WHOLE',          // whole items (e.g., "1 whole apple")
  
    // Miscellaneous
    'PINCH',          // pinch (~0.3g salt)
    'DASH',           // dash (~0.5ml)
    'DROP',           // drops (e.g., liquid medicine)
    'CAN',            // standard can sizes (e.g., "1 can of beans")
    'BOTTLE'          // bottles (e.g., "1 bottle of soda")
  ]),

  // models
  Step: a.customType({
    number: a.integer(),
    description: a.string(),
  }),

  Ingredient: a.customType({
    name: a.string(),
    quantity: a.float(),
    unit: a.ref('UnitType'),
  }),

  MealTypes: a.model({
    id: a.id().required(),
    name: a.string(),
  }).authorization(allow => [
    allow.publicApiKey().to(['read']),
  ]),

  FoodAllergies: a.model({
    id: a.id().required(),
    name: a.string(),
  }).authorization(allow => [
    allow.publicApiKey().to(['read']),
  ]),

  DietaryPreferences: a.model({
    id: a.id().required(),
    name: a.string(),
  }).authorization(allow => [
    allow.publicApiKey().to(['read']),
  ]),

  User: a.model({
    id: a.id().required(),
    allergies: a.string().array(),
    dietaryPrefs: a.string().array(),
    inventories: a.hasOne('Inventory', 'userId'),
    favorites: a.hasMany('Favorite', 'userId'),
    profileOwner: a.string()
  }).authorization(allow => [
    allow.ownerDefinedIn("profileOwner").to(['read', 'update', 'delete']),
    allow.authenticated().to(['read', 'update']),
    allow.publicApiKey().to(['read', 'create', 'update', 'delete'])
  ]),
  
  Inventory: a.model({
    id: a.id().required(),
    userId: a.string().required(), // stores Cognito sub
    user: a.belongsTo('User', 'userId'),
    name: a.string().required(),
    quantity: a.float().required(),
    unit: a.ref('UnitType').required(),
  })
  .secondaryIndexes((index) => [index('userId')])
  .authorization(allow => [allow.publicApiKey()]),
  
  Favorite: a.model({
    id: a.id().required(),
    userId: a.string().required(), // stores Cognito sub
    user: a.belongsTo('User', 'userId'),
    name: a.string().required(),
    mealType: a.string(),
    cookTime: a.integer().required(),
    ingredients: a.ref('Ingredient').array(),
    steps: a.string().array(),
  })
  .secondaryIndexes((index) => [index('userId')])
  .authorization(allow => [allow.publicApiKey(),]),
    // .authorization((allow) =>
    //   allow.owner({ provider: 'userPools', identityClaim: 'sub', ownerField: 'userSub' })
    // )
    // .index('byUserSub', ['userSub'])
    // .index('byUserAndCreatedAt', ['userSub', 'createdAt']),
}).authorization(allow => [
    allow.resource(postConfirmation)
  ]);

export type Schema = ClientSchema<typeof schema>;

// Una sola llamada a defineData
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
