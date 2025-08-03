import admin from "firebase-admin";
import serviceAccount from "./firebaseServiceAccountKey.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: "https://draftconlogin-default-rtdb.firebaseio.com"
  });
}

export default admin; 