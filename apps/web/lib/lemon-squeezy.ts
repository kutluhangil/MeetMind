interface CreateCheckoutParams {
  variantId: string;
  userId: string;
  email: string;
  currency?: 'USD' | 'TRY';
}

export async function createCheckoutUrl({
  variantId,
  userId,
  email,
  currency = 'USD',
}: CreateCheckoutParams): Promise<string> {
  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.LEMON_API_KEY}`,
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            custom: { user_id: userId },
            email,
          },
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?upgraded=true`,
          },
        },
        relationships: {
          store: { data: { type: 'stores', id: process.env.LEMON_STORE_ID } },
          variant: { data: { type: 'variants', id: variantId } },
        },
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Lemon Squeezy checkout error: ${err}`);
  }

  const data = await response.json() as { data: { attributes: { url: string } } };
  return data.data.attributes.url;
}

export function getVariantId(
  plan: 'pro' | 'team',
  interval: 'monthly' | 'yearly',
  currency: 'USD' | 'TRY'
): string {
  const key = `LEMON_${plan.toUpperCase()}_${interval.toUpperCase()}_${currency}_ID`;
  const id = process.env[key];
  if (!id) throw new Error(`Missing env var: ${key}`);
  return id;
}
