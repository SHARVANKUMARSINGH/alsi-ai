import { Account, Client, Databases, ID, Query } from "react-native-appwrite";

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const usersCollectionId = process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID;

if (!endpoint || !projectId || !databaseId || !usersCollectionId) {
  throw new Error("Appwrite configuration is incomplete. Check the configured endpoint, project, database, and users collection IDs.");
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setPlatform("com.app.alsiai");

export const appwriteAccount = new Account(client);
export const appwriteDatabases = new Databases(client);
export const APPWRITE_DATABASE_ID = databaseId;
export const APPWRITE_USERS_COLLECTION_ID = usersCollectionId;
export { ID, Query };
