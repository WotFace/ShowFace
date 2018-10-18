import { auth } from '../firebase';

export function isSignedIn() {
  return !!auth().currentUser;
}

// If logged in, returns a Promise which resolves to an object of the AuthInput
// GraphQL type, else returns null.
export async function getAuthInput() {
  const { currentUser } = auth();
  if (!currentUser) return null;
  const { uid } = currentUser;
  const token = await currentUser.getIdToken();
  return { uid, token };
}

// If logged in, returns an object with email, displayName, else returns null.
export function getFirebaseUserInfo() {
  const { currentUser } = auth();
  if (!currentUser) return null;
  const { uid, email, displayName } = currentUser;
  return { uid, email, displayName };
}
