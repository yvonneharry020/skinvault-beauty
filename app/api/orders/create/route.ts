import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type OrderItem = {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
};

type CreateOrderBody = {
  paymentReference: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  deliveryAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
  };
};

async function verifyPaystackPayment(reference: string): Promise<boolean> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return false;

  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: 'no-store',
    });
    const data = await res.json() as { status: boolean; data?: { status: string } };
    return data.status === true && data.data?.status === 'success';
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CreateOrderBody;
    const { paymentReference, items, subtotal, shipping, total, deliveryAddress } = body;

    if (!paymentReference || !items?.length || !deliveryAddress) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const verified = await verifyPaystackPayment(paymentReference);
    if (!verified) {
      return NextResponse.json({ error: 'Payment could not be verified.' }, { status: 402 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id ?? null,
        status: 'paid',
        payment_provider: 'paystack',
        payment_reference: paymentReference,
        payment_status: 'paid',
        subtotal,
        shipping,
        discount: 0,
        total,
        currency: 'NGN',
        notes: `Deliver to: ${deliveryAddress.fullName}, ${deliveryAddress.line1}, ${deliveryAddress.city}, ${deliveryAddress.state}`,
      })
      .select('id')
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Failed to save order.' }, { status: 500 });
    }

    const { error: itemsErr } = await supabase.from('order_items').insert(
      items.map(i => ({
        order_id: order.id,
        product_id: i.product_id,
        product_name: i.product_name,
        price: i.price,
        quantity: i.quantity,
        subtotal: i.subtotal,
      }))
    );

    if (itemsErr) {
      return NextResponse.json({ error: 'Failed to save order items.' }, { status: 500 });
    }

    return NextResponse.json({ orderId: order.id });
  } catch {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 });
  }
}
