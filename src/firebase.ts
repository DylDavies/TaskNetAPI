import admin from 'firebase-admin';
import serviceAccount from "../firebase-admin.json";

serviceAccount.private_key_id = process.env.PRIVATE_KEY_ID as string;
serviceAccount.private_key = process.env.PRIVATE_KEY as string;

console.log(process.env.PRIVATE_KEY)
console.log(process.env.PRIVATE_KEY_ID)

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

export { app };