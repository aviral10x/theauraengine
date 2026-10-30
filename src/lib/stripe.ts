import "server-only";
import Stripe from "stripe";
import { env } from "./env";

let stripe: Stripe | null = null;
export function stripeClient() {
  if (!stripe) stripe = new Stripe(env.stripeSecret);
  return stripe;
}
