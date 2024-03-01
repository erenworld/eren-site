import { get, limitToLast, query, ref, push, set } from "firebase/database";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectID: "florians-website",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  if (req.method === "GET") {
    let letters = {};

    try {
      const lastLetters = query(ref(database, "letters"), limitToLast(3));
      letters = await (await get(lastLetters)).val();

      letters = Object.fromEntries(
        Object.entries(letters).filter(([, value]) => value !== undefined)
      );

      res.end(JSON.stringify(letters));
    } catch (error) {
      console.error("Error fetching letters.", error);
      res.statusCode = 500;
    }
  } else if (req.method === "POST") {
    const { text, signature, handle } = req.body;
    try {
      const newLetter = await push(ref(database, "letters"));
      await set(newLetter, {
        text,
        signature,
        handle: handle || null,
      });

      res.statusCode = 200;
      res.end();
    } catch (error) {
      console.error("Error adding letter.", error);
      res.statusCode = 500;
      res.end();
    }
  }
}
