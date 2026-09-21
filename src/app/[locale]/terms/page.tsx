import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return {
    title:
      locale === "mm"
        ? "ဝန်ဆောင်မှုဆိုင်ရာ စည်းမျဉ်းများ"
        : "Terms of Service",
  };
}

function TermsEn() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="lead">
        Welcome to <strong>The supplier Kaung Set</strong>. These Terms of
        Service (“Terms”) govern your access to and use of our website,
        products, and related services. By browsing the store or placing an
        order, you agree to these Terms and our Privacy Policy.
      </p>
      <p className="meta">Last updated: September 2026</p>

      <h2>1. General Conditions</h2>
      <p>
        You must provide accurate contact and delivery information when
        ordering. You are responsible for maintaining the confidentiality of
        your account credentials. We may refuse service, cancel orders, or
        restrict access if we reasonably suspect fraud, abuse, or violation of
        these Terms. We reserve the right to update these Terms; material
        changes will be reflected by updating the date above.
      </p>

      <h2>2. Products &amp; Pricing</h2>
      <p>
        Product descriptions, images, stock levels, and prices (in Myanmar Kyat
        / MMK unless otherwise stated) are shown in good faith. We strive for
        accuracy but do not warrant that all content is error-free. Colors and
        appearance may vary slightly from device displays. We may correct
        pricing or description errors and cancel affected orders before
        shipment, with a full refund of amounts already paid where applicable.
        Promotional codes and loyalty discounts apply only under the rules
        stated at checkout or in the offer.
      </p>

      <h2>3. Orders</h2>
      <p>
        Submitting an order constitutes an offer to purchase. Acceptance occurs
        when we confirm the order and begin fulfillment (including payment
        verification for KBZ Pay, KBZ Banking, or KBZ Special). We may decline
        or cancel an order due to
        stock unavailability, payment issues, pricing errors, or suspected
        unauthorized activity. You will be notified using the contact details
        provided at checkout.
      </p>

      <h2>4. Payment Terms (Full &amp; Half Payment)</h2>
      <p>
        We currently accept payments via KBZ Pay, KBZ Banking, and KBZ Special.
        We do not offer standard Cash on Delivery.
      </p>
      <ul>
        <li>
          <strong>Full Payment</strong> — Pay 100% of the order total upfront by
          scanning our QR code for your chosen method (KBZ Pay, KBZ Banking, or
          KBZ Special) and uploading the transaction receipt at checkout.
        </li>
        <li>
          <strong>Half Payment (50% Deposit)</strong> — Pay 50% of the order
          total upfront via KBZ Pay, KBZ Banking, or KBZ Special to confirm the
          order. The remaining 50% must be paid to the courier upon delivery.
        </li>
      </ul>
      <p>
        Payments are verified manually by our team. Orders remain pending until
        the initial deposit or full payment is verified. Incomplete, incorrect,
        or unverifiable proof may delay or cancel the order. You are responsible
        for any bank / wallet fees charged by your payment provider. We do not
        store full payment-card numbers on our servers.
      </p>

      <h2>5. Shipping &amp; Delivery</h2>
      <p>
        Delivery estimates are approximate and may vary by location, courier
        capacity, weather, or peak seasons. Shipping fees (if any) are
        calculated at checkout; free-shipping thresholds may apply when
        advertised. Risk of loss passes to you upon delivery to the address you
        provided, except where required otherwise by law. Please ensure someone
        is available to receive the package and that your phone number is
        reachable.
      </p>
      <p>
        When an order ships, we may email your tracking number (via Resend) and
        update status in your account. You can also track orders using the
        tracking tools on our site.
      </p>

      <h2>6. Return &amp; Refund Policy</h2>
      <p>
        <strong>All sales are final</strong> once an order has been successfully
        delivered, except where an item is <strong>defective</strong>, damaged in
        transit, or materially different from what was described (wrong item).
      </p>
      <ul>
        <li>
          Report defective, damaged, or incorrect items within a reasonable time
          (preferably within 48 hours of delivery) via WhatsApp or our Contact
          page, with clear photos and your order / tracking number.
        </li>
        <li>
          Approved cases may be resolved by replacement (subject to stock) or a
          refund / store credit for the affected item(s), at our discretion.
        </li>
        <li>
          We do not accept returns for change of mind, incorrect size /
          preference selections you made, or items damaged after delivery due to
          misuse.
        </li>
      </ul>

      <h2>7. Coupons, Loyalty &amp; Promotions</h2>
      <p>
        Promo codes and loyalty benefits are subject to eligibility rules,
        expiry dates, and usage limits. We may revoke discounts obtained through
        error or abuse. Benefits have no cash value unless required by law.
      </p>

      <h2>8. Intellectual Property</h2>
      <p>
        Store content — including branding, product photography, and copy — is
        owned by The supplier Kaung Set or its licensors. You may not copy,
        scrape, or commercially reuse our content without prior written
        permission.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by applicable law, The supplier Kaung
        Set is not liable for indirect, incidental, or consequential damages
        arising from your use of the site or purchased products. Our total
        liability for any claim related to an order is limited to the amount you
        paid for that order. Nothing in these Terms excludes liability that
        cannot be limited under Myanmar law.
      </p>

      <h2>10. Governing Law</h2>
      <p>
        These Terms are governed by the laws of Myanmar. Disputes should first
        be raised with us in good faith via WhatsApp or email; if unresolved,
        they may be submitted to the competent courts of Myanmar.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these Terms? Visit our <Link href="/contact">Contact</Link>{" "}
        page, message us on WhatsApp, or email{" "}
        <a href="mailto:hello@thesupplierkaungset.com">
          hello@thesupplierkaungset.com
        </a>
        .
      </p>
    </>
  );
}

function TermsMm() {
  return (
    <>
      <h1>ဝန်ဆောင်မှုဆိုင်ရာ စည်းကမ်းချက်များ</h1>
      <p className="lead">
        <strong>The supplier Kaung Set</strong> မှ ကြိုဆိုပါသည်။ ဤ
        ဝန်ဆောင်မှုဆိုင်ရာ စည်းကမ်းချက်များ (“စည်းကမ်းချက်များ”) သည် ကျွန်ုပ်တို့၏
        ဝဘ်ဆိုက်၊ ထုတ်ကုန်များနှင့် ဆက်စပ်ဝန်ဆောင်မှုများကို သင်၏
        ဝင်ရောက်ကြည့်ရှုခြင်းနှင့် အသုံးပြုခြင်းကို ထိန်းချုပ်ထားပါသည်။ စတိုးဆိုင်ကို
        ကြည့်ရှုခြင်း သို့မဟုတ် အော်ဒါတင်ခြင်းဖြင့်၊ သင်သည် ဤစည်းကမ်းချက်များနှင့်
        ကျွန်ုပ်တို့၏ ကိုယ်ရေးအချက်အလက်လုံခြုံမှုဆိုင်ရာ မူဝါဒကို
        သဘောတူလက်ခံပါသည်။
      </p>
      <p className="meta">
        နောက်ဆုံးပြင်ဆင်ခဲ့သည့်ရက်စွဲ - စက်တင်ဘာလ၊ ၂၀၂၆ ခုနှစ်
      </p>

      <h2>၁။ အထွေထွေ အခြေအနေများ</h2>
      <p>
        အော်ဒါတင်သည့်အခါ တိကျမှန်ကန်သော ဆက်သွယ်ရန်နှင့် ပို့ဆောင်ရမည့်
        အချက်အလက်များကို ပေးဆောင်ရမည်ဖြစ်ပါသည်။ သင့်အကောင့် အချက်အလက်များ
        လုံခြုံရေးကို ထိန်းသိမ်းရန်မှာ သင့်တာဝန်သာ ဖြစ်ပါသည်။ လိမ်လည်မှု၊
        အလွဲသုံးစားမှု သို့မဟုတ် ဤစည်းကမ်းချက်များကို ချိုးဖောက်သည်ဟု ကျွန်ုပ်တို့
        ကျိုးကြောင်းဆီလျော်စွာ သံသယရှိပါက ဝန်ဆောင်မှုပေးရန် ငြင်းဆိုခြင်း၊
        အော်ဒါများကို ပယ်ဖျက်ခြင်း သို့မဟုတ် ဝင်ရောက်အသုံးပြုခွင့်ကို
        ကန့်သတ်ခြင်းများ ပြုလုပ်နိုင်ပါသည်။ ဤစည်းကမ်းချက်များကို အပ်ဒိတ်လုပ်ရန်
        အခွင့်အရေးကို ကျွန်ုပ်တို့ ရယူထားပြီး၊ အဓိကပြောင်းလဲမှုများရှိပါက
        အထက်ပါရက်စွဲကို ပြင်ဆင်ပေးသွားမည်ဖြစ်ပါသည်။
      </p>

      <h2>၂။ ထုတ်ကုန်များနှင့် စျေးနှုန်းများ</h2>
      <p>
        ထုတ်ကုန် ဖော်ပြချက်များ၊ ပုံများ၊ ပစ္စည်းလက်ကျန် အခြေအနေများနှင့်
        ဈေးနှုန်းများကို (အခြားသို့ ဖော်ပြမထားပါက မြန်မာကျပ်ငွေ / MMK ဖြင့်)
        မှန်ကန်စွာ ဖော်ပြထားပါသည်။ ကျွန်ုပ်တို့သည် တိကျမှန်ကန်မှုရှိစေရန်
        ကြိုးပမ်းသော်လည်း အကြောင်းအရာအားလုံးတွင် အမှားအယွင်းကင်းစင်မည်ဟု
        အာမမခံနိုင်ပါ။ အရောင်နှင့် ပုံပန်းသဏ္ဍာန်သည် စက်ပစ္စည်း
        ဖန်သားပြင်များပေါ်မူတည်၍ အနည်းငယ် ကွဲပြားနိုင်ပါသည်။ ကျွန်ုပ်တို့သည်
        ဈေးနှုန်း သို့မဟုတ် ဖော်ပြချက် အမှားအယွင်းများကို ပြင်ဆင်ခွင့်ရှိပြီး၊
        ထိခိုက်မှုရှိသော အော်ဒါများကို ပစ္စည်းမပို့မီ ပယ်ဖျက်နိုင်ကာ (သက်ဆိုင်ပါက)
        ပေးချေထားသော ငွေပမာဏကို အပြည့်အဝ ပြန်အမ်းပေးမည်ဖြစ်ပါသည်။ ပရိုမိုကုဒ်များနှင့်
        သစ္စာရှိဖောက်သည် (loyalty) လျှော့စျေးများသည် ငွေပေးချေသည့်နေရာ သို့မဟုတ်
        ကမ်းလှမ်းချက်တွင် ဖော်ပြထားသော စည်းမျဉ်းများအတိုင်းသာ
        အကျုံးဝင်မည်ဖြစ်ပါသည်။
      </p>

      <h2>၃။ အော်ဒါများ</h2>
      <p>
        အော်ဒါတင်ခြင်းသည် ဝယ်ယူရန် ကမ်းလှမ်းခြင်းကို ဆိုလိုပါသည်။ ကျွန်ုပ်တို့မှ
        အော်ဒါကို အတည်ပြုပြီး (KBZ Pay၊ KBZ Banking သို့မဟုတ် KBZ Special အတွက်
        ငွေပေးချေမှု အတည်ပြုခြင်း အပါအဝင်)
        ပစ္စည်းပို့ဆောင်ရန် စတင်ပြင်ဆင်သည့်အချိန်တွင် လက်ခံမှုကို
        အတည်ပြုပြီးဖြစ်ပါသည်။ ပစ္စည်းလက်ကျန်မရှိခြင်း၊ ငွေပေးချေမှုဆိုင်ရာ
        ပြဿနာများ၊ စျေးနှုန်းအမှားအယွင်းများ သို့မဟုတ် ခွင့်ပြုချက်မရှိဘဲ
        လုပ်ဆောင်သည်ဟု သံသယရှိသည့် ကိစ္စများကြောင့် အော်ဒါကို ငြင်းပယ်ခြင်း သို့မဟုတ်
        ပယ်ဖျက်ခြင်းများ ပြုလုပ်နိုင်ပါသည်။ ငွေပေးချေသည့်နေရာတွင် သင်ပေးထားသော
        ဆက်သွယ်ရန် အချက်အလက်များမှတစ်ဆင့် သင့်အား အကြောင်းကြားမည်ဖြစ်ပါသည်။
      </p>

      <h2>
        ၄။ ငွေပေးချေမှု စည်းမျဉ်းများ (အပြည့်ပေးချေခြင်း နှင့်
        တစ်ဝက်ကြိုတင်ပေးချေခြင်း)
      </h2>
      <p>
        ကျွန်ုပ်တို့သည် လက်ရှိတွင် ပစ္စည်းရောက်မှ ငွေချေသည့်စနစ် (COD) ကို
        လက်ခံထားခြင်း မရှိပါ။ ယခုအခါ KBZ Pay၊ KBZ Banking နှင့် KBZ Special
        တို့မှတစ်ဆင့် အောက်ပါ ငွေပေးချေမှု စနစ်များကို လက်ခံပါသည်—
      </p>
      <ul>
        <li>
          <strong>အပြည့်ပေးချေခြင်း (Full Payment)</strong> — အော်ဒါကျသင့်ငွေ
          ၁၀၀% ကို သင်ရွေးချယ်သောနည်းလမ်း (KBZ Pay၊ KBZ Banking သို့မဟုတ် KBZ
          Special) အတွက် QR ကုဒ် စကန်ဖတ်၍ ကြိုတင်ပေးချေပြီး၊ ငွေပေးချေမှု
          အထောက်အထားကို အော်ဒါတင်သည့်နေရာတွင် တင်ပေးပါ။
        </li>
        <li>
          <strong>တစ်ဝက်ကြိုတင်ပေးချေခြင်း (Half Payment)</strong> — အော်ဒါကို
          အတည်ပြုရန်အတွက် ကျသင့်ငွေ၏ ၅၀% ကို KBZ Pay၊ KBZ Banking သို့မဟုတ် KBZ
          Special မှတစ်ဆင့် ကြိုတင်ပေးချေရပါမည်။ ကျန် ၅၀% ကို ပစ္စည်းလာပို့သူထံသို့
          ပေးချေရပါမည်။
        </li>
      </ul>
      <p>
        ငွေပေးချေမှုများကို ကျွန်ုပ်တို့အဖွဲ့မှ လူကိုယ်တိုင်
        အတည်ပြုစစ်ဆေးပါမည်။ အစောပိုင်း ငွေပေးချေမှု (deposit သို့မဟုတ်
        အပြည့်ပေးချေမှု) အတည်မပြုမချင်း အော်ဒါများသည် ဆိုင်းငံ့ (pending)
        အဖြစ် ရှိနေမည်ဖြစ်ပါသည်။ မပြည့်စုံသော၊ မှားယွင်းသော သို့မဟုတ်
        အတည်ပြု၍မရသော အထောက်အထားများကြောင့် အော်ဒါနှောင့်နှေးခြင်း သို့မဟုတ်
        ပယ်ဖျက်ခြင်းများ ဖြစ်ပေါ်နိုင်ပါသည်။ သင်၏ ငွေပေးချေမှု
        ဝန်ဆောင်မှုပေးသူမှ ကောက်ခံသော ဘဏ်/ပိုက်ဆံအိတ် ဝန်ဆောင်ခများကို
        သင်ကိုယ်တိုင် ပေးဆောင်ရမည်ဖြစ်ပါသည်။ ကျွန်ုပ်တို့၏ ဆာဗာများတွင်
        ငွေပေးချေသည့် ကတ်နံပါတ်အပြည့်အစုံကို သိမ်းဆည်းထားခြင်း မရှိပါ။
      </p>

      <h2>၅။ ပစ္စည်းပို့ဆောင်ခြင်း</h2>
      <p>
        ခန့်မှန်းခြေ ပစ္စည်းရောက်ရှိမည့်အချိန်သည် တည်နေရာ၊ ပို့ဆောင်ရေးကုမ္ပဏီ၏
        ဝန်ဆောင်မှုပေးနိုင်စွမ်း၊ ရာသီဥတု သို့မဟုတ် အလုပ်များသော
        ရာသီများပေါ်မူတည်၍ ကွဲပြားနိုင်ပါသည်။ ပို့ဆောင်ခ (ရှိပါက) ကို
        ငွေပေးချေသည့်နေရာတွင် တွက်ချက်ပြသမည်ဖြစ်ပြီး၊ ကြော်ငြာထားသည့်အခါ
        အခမဲ့ပို့ဆောင်ပေးမည့် သတ်မှတ်ချက်များ ရှိနိုင်ပါသည်။ ဥပဒေအရ အခြားသို့
        သတ်မှတ်ထားခြင်းမရှိပါက၊ သင်ပေးထားသော လိပ်စာသို့ ပစ္စည်းပေးပို့ပြီးသည်နှင့်
        ပျောက်ဆုံးမှုအန္တရာယ်သည် သင့်တာဝန်သာ ဖြစ်သွားပါမည်။ ပစ္စည်းလက်ခံမည့်သူရှိရန်နှင့်
        သင့်ဖုန်းနံပါတ်ကို ဆက်သွယ်၍ရရန် သေချာပါစေ။
      </p>
      <p>
        အော်ဒါကို ပို့ဆောင်လိုက်သည့်အခါ သင့်ထံသို့ tracking နံပါတ်ကို (Resend
        မှတစ်ဆင့်) အီးမေးလ်ပို့ပေးမည်ဖြစ်ပြီး သင့်အကောင့်တွင် အခြေအနေကို
        အပ်ဒိတ်လုပ်ပေးမည်ဖြစ်ပါသည်။ ကျွန်ုပ်တို့ ဝဘ်ဆိုက်ရှိ tracking tools များကို
        အသုံးပြု၍လည်း အော်ဒါကို ခြေရာခံနိုင်ပါသည်။
      </p>

      <h2>၆။ ပြန်အမ်းငွေနှင့် ပစ္စည်းပြန်လည်လက်ခံခြင်းဆိုင်ရာ မူဝါဒ</h2>
      <p>
        ချို့ယွင်းချက်ရှိနေခြင်း၊ လမ်းခရီးတွင် ပျက်စီးသွားခြင်း သို့မဟုတ်
        ဖော်ပြထားသည်နှင့် လုံးဝကွဲပြားနေခြင်း (ပစ္စည်းမှားယွင်းခြင်း) မှလွဲ၍
        ပစ္စည်းကို အောင်မြင်စွာ ပို့ဆောင်ပြီးသည်နှင့်{" "}
        <strong>အရောင်းအဝယ် အပြီးအပြတ်ဖြစ်ပါသည်</strong>။
      </p>
      <ul>
        <li>
          ချို့ယွင်းချက်ရှိသော၊ ပျက်စီးနေသော သို့မဟုတ် မှားယွင်းသော ပစ္စည်းများအတွက်
          ကျိုးကြောင်းဆီလျော်သော အချိန်အတွင်း (ပစ္စည်းလက်ခံရရှိပြီး ၄၈ နာရီအတွင်း
          ပိုကောင်းပါသည်) ရှင်းလင်းသော ဓာတ်ပုံများ၊ အော်ဒါ/tracking
          နံပါတ်တို့နှင့်အတူ WhatsApp သို့မဟုတ် ကျွန်ုပ်တို့၏ Contact
          စာမျက်နှာမှတစ်ဆင့် အကြောင်းကြားပါ။
        </li>
        <li>
          အတည်ပြုထားသော ကိစ္စရပ်များအတွက် ကျွန်ုပ်တို့၏ ဆုံးဖြတ်ချက်အရ
          (ပစ္စည်းလက်ကျန်အပေါ် မူတည်၍) အစားထိုးလဲလှယ်ပေးခြင်း သို့မဟုတ် သက်ဆိုင်ရာ
          ပစ္စည်းအတွက် ငွေပြန်အမ်းပေးခြင်း / store credit ပေးခြင်းများ
          ပြုလုပ်ပေးပါမည်။
        </li>
        <li>
          စိတ်ပြောင်းသွားခြင်း၊ အရွယ်အစား/ရွေးချယ်မှု မှားယွင်းခြင်း သို့မဟုတ်
          ပစ္စည်းလက်ခံရရှိပြီးနောက် အလွဲသုံးစားလုပ်ခြင်းကြောင့် ပျက်စီးသွားသော
          ပစ္စည်းများအတွက် ပြန်လည်လက်ခံမည် မဟုတ်ပါ။
        </li>
      </ul>

      <h2>၇။ ကူပွန်များ၊ သစ္စာရှိဖောက်သည် အစီအစဉ်များနှင့် ပရိုမိုးရှင်းများ</h2>
      <p>
        ပရိုမိုကုဒ်များနှင့် သစ္စာရှိဖောက်သည် အကျိုးခံစားခွင့်များသည် ရထိုက်ခွင့်
        စည်းမျဉ်းများ၊ သက်တမ်းကုန်ဆုံးရက်များနှင့် အသုံးပြုမှု ကန့်သတ်ချက်များအပေါ်
        အခြေခံပါသည်။ အမှားအယွင်း သို့မဟုတ် အလွဲသုံးစားလုပ်မှုကြောင့် ရရှိသော
        လျှော့စျေးများကို ကျွန်ုပ်တို့မှ ရုပ်သိမ်းနိုင်ပါသည်။ ဥပဒေအရ လိုအပ်သည်မှလွဲ၍
        အကျိုးခံစားခွင့်များကို ငွေသားအဖြစ် ပြောင်းလဲ၍မရပါ။
      </p>

      <h2>၈။ ဉာဏပစ္စည်းမူပိုင်ခွင့်</h2>
      <p>
        အမှတ်တံဆိပ်၊ ထုတ်ကုန်ဓာတ်ပုံများနှင့် စာသားများ အပါအဝင် စတိုးဆိုင်ရှိ
        အကြောင်းအရာများကို The supplier Kaung Set သို့မဟုတ် ၎င်း၏
        လိုင်စင်ရယူထားသူများမှ ပိုင်ဆိုင်ပါသည်။ ကျွန်ုပ်တို့၏
        ကြိုတင်ရေးသားခွင့်ပြုချက်မပါဘဲ ကျွန်ုပ်တို့၏ အကြောင်းအရာများကို
        ကူးယူခြင်း၊ ရယူသုံးစွဲခြင်း သို့မဟုတ် စီးပွားရေးအရ ပြန်လည်အသုံးပြုခြင်းများ
        မပြုလုပ်ရပါ။
      </p>

      <h2>၉။ တာဝန်ယူမှု ကန့်သတ်ချက်</h2>
      <p>
        သက်ဆိုင်ရာ ဥပဒေမှ ခွင့်ပြုထားသည့် အမြင့်ဆုံးအတိုင်းအတာအထိ၊ The supplier
        Kaung Set သည် ဝဘ်ဆိုက်ကို အသုံးပြုခြင်း သို့မဟုတ် ဝယ်ယူထားသော
        ထုတ်ကုန်များကြောင့် ဖြစ်ပေါ်လာသော သွယ်ဝိုက်သော၊ မတော်တဆဖြစ်သော သို့မဟုတ်
        ဆက်စပ်ဖြစ်ပေါ်လာသော ပျက်စီးဆုံးရှုံးမှုများအတွက် တာဝန်မရှိပါ။ အော်ဒါတစ်ခုနှင့်
        ပတ်သက်သည့် မည်သည့် တောင်းဆိုမှုအတွက်မဆို ကျွန်ုပ်တို့၏ စုစုပေါင်း
        တာဝန်ယူမှုသည် ထိုအော်ဒါအတွက် သင်ပေးချေခဲ့သော ပမာဏထက် မကျော်လွန်ပါ။
        ဤစည်းကမ်းချက်များတွင် ပါဝင်သည့် မည်သည့်အချက်ကမျှ မြန်မာနိုင်ငံ ဥပဒေအရ
        ကန့်သတ်၍မရသော တာဝန်ယူမှုများကို ဖယ်ရှားထားခြင်း မရှိပါ။
      </p>

      <h2>၁၀။ အုပ်ချုပ်မည့် ဥပဒေ</h2>
      <p>
        ဤစည်းကမ်းချက်များကို မြန်မာနိုင်ငံ၏ ဥပဒေများက အုပ်ချုပ်ပါသည်။
        အငြင်းပွားမှုများကို သဘောရိုးဖြင့် WhatsApp သို့မဟုတ် အီးမေးလ်မှတစ်ဆင့်
        ကျွန်ုပ်တို့ထံ ဦးစွာ တင်ပြသင့်ပါသည်။ အကယ်၍ ဖြေရှင်း၍မရပါက၊ မြန်မာနိုင်ငံရှိ
        သက်ဆိုင်ရာ တရားရုံးများသို့ တင်သွင်းနိုင်ပါသည်။
      </p>

      <h2>၁၁။ ဆက်သွယ်ရန်</h2>
      <p>
        ဤစည်းကမ်းချက်များနှင့် ပတ်သက်၍ မေးမြန်းလိုပါက ကျွန်ုပ်တို့၏{" "}
        <Link href="/contact">Contact</Link> စာမျက်နှာသို့ ဝင်ရောက်ကြည့်ရှုပါ၊
        WhatsApp မှတစ်ဆင့် မက်ဆေ့ချ်ပို့ပါ၊ သို့မဟုတ်{" "}
        <a href="mailto:hello@thesupplierkaungset.com">
          hello@thesupplierkaungset.com
        </a>{" "}
        သို့ အီးမေးလ်ပို့ပါ။
      </p>
    </>
  );
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header showSearch={false} />
      <main className="page-shell mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10 lg:px-12">
        <article className="legal-prose">
          {locale === "mm" ? <TermsMm /> : <TermsEn />}
        </article>
      </main>
    </>
  );
}
