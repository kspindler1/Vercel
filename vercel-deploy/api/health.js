import { allowedProviders } from "../server/ai/providers.js";

export default function handler(_request, response) {
  response.status(200).json({ status: "ok", providers: allowedProviders() });
}
