import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBUbDranO8eGJLiql06707XlRhl-9p6OKY",
  authDomain: "draftconlogin.firebaseapp.com",
  databaseURL: "https://draftconlogin-default-rtdb.firebaseio.com",
  projectId: "draftconlogin",
  storageBucket: "draftconlogin.firebasestorage.app",
  messagingSenderId: "32454363862",
  appId: "1:32454363862:web:ed9f268790dd7b3afed777",
  measurementId: "G-V9FJWTGSYP"
};

const app = initializeApp(firebaseConfig);

let analytics: ReturnType<typeof getAnalytics> | undefined = undefined;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics }; 