import admin from 'firebase-admin';
import serviceAccount from "../firebase-admin.json";

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

export { app };