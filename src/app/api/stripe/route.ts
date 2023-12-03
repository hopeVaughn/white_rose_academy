import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

const settingsUrl = process.env.NEXTAUTH_URL + '/settings';
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized in api/stripe/route.ts', { status: 401 });
    }

    const userSubscriptions = await prisma.userSubscription.findUnique({
      where: {
        userId: session.user.id,
      }
    });
    // if they have a previous subscription, redirect them to the Stripe portal to manage it
    if (userSubscriptions && userSubscriptions.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscriptions.stripeCustomerId,
        return_url: settingsUrl,
      });
      return NextResponse.json({ url: stripeSession.url });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: session.user.email ?? "",
      line_items: [
        {
          price_data: {
            currency: "CAD",
            product_data: {
              name: "White Rose Academy Enrollment",
              description: "Enroll in White Rose Academy",
            },
            unit_amount: 2500,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
      },
    });
    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    console.log("STRIPE ERROR in app/api/stripe", error);
    return new NextResponse("internal server error", { status: 500 });
  }
}