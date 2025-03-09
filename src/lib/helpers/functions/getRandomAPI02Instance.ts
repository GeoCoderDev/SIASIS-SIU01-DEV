import "dotenv/config";

export default function getRandomAPI02IntanceURL() {
  return process.env[`NEXT_PUBLIC_API02_INS${Math.round(Math.random() * 5)}}_URL_BASE`];
}
