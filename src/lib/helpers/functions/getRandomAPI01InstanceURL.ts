

import "dotenv/config";

export default function getRandomAPI01IntanceURL() {
  const VariableEntornoName = `API01_INS${Math.round(
    Math.random() * 3
  )}_URL_BASE`;

  console.log(VariableEntornoName);

  return process.env.NEXT_PUBLIC_API01_INS1_URL_BASE;
}
