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
        ? "ကိုယ်ရေးအချက်အလက်လုံခြုံမှုဆိုင်ရာ မူဝါဒ"
        : "Privacy Policy",
  };
}

function PrivacyEn() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="lead">
        This Privacy Policy describes how <strong>The supplier Kaung Set</strong>{" "}
        (“we”, “us”, or “our”) collects, uses, stores, and shares personal
        information when you visit our online store, create an account, or place
        an order.
      </p>
      <p className="meta">Last updated: September 2026</p>

      <h2>1. Information We Collect</h2>
      <p>
        We collect information that is necessary to operate our storefront and
        fulfill your orders, including:
      </p>
      <ul>
        <li>
          <strong>Identity &amp; contact details</strong> — name, email address,
          and phone number.
        </li>
        <li>
          <strong>Delivery information</strong> — shipping address, city, and any
          delivery notes you provide at checkout.
        </li>
        <li>
          <strong>Account data</strong> — login credentials and profile details
          when you register or sign in (handled securely via Supabase
          Authentication).
        </li>
        <li>
          <strong>Order &amp; payment references</strong> — items purchased,
          order totals, tracking numbers, and KBZ Pay transaction references or
          payment receipt uploads you submit for manual verification. We do not
          store your full bank card numbers; KBZ Pay payments are processed
          outside our site via QR code.
        </li>
        <li>
          <strong>Usage &amp; analytics data</strong> — pages viewed, product
          clicks, and similar traffic metrics collected through Google Analytics
          / Google Tag Manager.
        </li>
        <li>
          <strong>Support communications</strong> — messages you send via our
          contact form or WhatsApp.
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Process, confirm, and fulfill orders and deliveries.</li>
        <li>
          Verify KBZ Pay payments and update order / payment status in our admin
          tools.
        </li>
        <li>
          Send transactional emails (such as shipping notifications and tracking
          numbers) through Resend.
        </li>
        <li>
          Provide customer support over WhatsApp and email, including order
          follow-ups.
        </li>
        <li>
          Operate accounts, loyalty benefits, wishlists, and related storefront
          features.
        </li>
        <li>
          Analyze website traffic and product interest with Google Analytics so
          we can improve merchandising and marketing.
        </li>
        <li>
          Protect against fraud, abuse, and unauthorized access, and comply with
          applicable legal obligations.
        </li>
      </ul>

      <h2>3. Data Storage &amp; Security</h2>
      <p>
        Order, account, and catalog data are stored in <strong>Supabase</strong>,
        which provides a managed PostgreSQL database, authentication, and access
        controls (including row-level security where configured). We take
        reasonable technical and organizational measures to protect personal data
        against loss, misuse, and unauthorized access. No method of transmission
        or storage is 100% secure; please use a strong password and keep your
        login details private.
      </p>

      <h2>4. Third-Party Services</h2>
      <p>
        We rely on trusted providers to run the store. These parties process data
        only as needed to provide their services:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — database hosting, authentication, and file
          storage (for example payment receipts).
        </li>
        <li>
          <strong>Google Analytics / Google Tag Manager</strong> — website
          traffic and product interaction analytics.
        </li>
        <li>
          <strong>Resend</strong> — transactional email delivery (order /
          shipping notices).
        </li>
        <li>
          <strong>WhatsApp</strong> — customer support conversations you initiate
          or respond to.
        </li>
        <li>
          <strong>KBZ Pay</strong> — manual QR payment confirmation; payment
          activity occurs in the KBZ Pay app according to KBZ’s own terms and
          privacy practices.
        </li>
        <li>
          <strong>Delivery partners / couriers</strong> — name, phone, and
          address as required to ship your order.
        </li>
      </ul>
      <p>
        These providers have their own privacy policies. We do not sell your
        personal information.
      </p>

      <h2>5. Cookies &amp; Similar Technologies</h2>
      <p>
        Our site and analytics tools may use cookies or local storage (for
        example to keep you signed in, remember your cart, or measure traffic).
        You can control cookies through your browser settings; disabling some
        cookies may affect site functionality.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We retain order and account records for as long as needed to fulfill
        orders, provide support, meet accounting or legal requirements, and
        resolve disputes. Analytics data is retained according to our Google
        Analytics configuration.
      </p>

      <h2>7. Your Choices &amp; Rights</h2>
      <p>
        Depending on applicable law, you may request access to, correction of, or
        deletion of personal data we hold about you, or ask us to update your
        account details. You may also opt out of non-essential marketing
        messages. To make a request, contact us using the details below.
      </p>

      <h2>8. Children’s Privacy</h2>
      <p>
        Our store is intended for customers who can lawfully enter into purchase
        transactions. We do not knowingly collect personal information from
        children. If you believe a child has provided us data, please contact us
        so we can delete it.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The “Last updated”
        date at the top will change when we do. Continued use of the site after
        updates constitutes acceptance of the revised policy.
      </p>

      <h2>10. Contact Us</h2>
      <p>
        For privacy questions or requests, reach us via the{" "}
        <Link href="/contact">Contact</Link> page, WhatsApp (number listed on our
        site), or email{" "}
        <a href="mailto:hello@thesupplierkaungset.com">
          hello@thesupplierkaungset.com
        </a>
        .
      </p>
    </>
  );
}

function PrivacyMm() {
  return (
    <>
      <h1>ကိုယ်ရေးအချက်အလက်လုံခြုံမှုဆိုင်ရာ မူဝါဒ</h1>
      <p className="lead">
        ဤ ကိုယ်ရေးအချက်အလက်လုံခြုံမှုဆိုင်ရာ မူဝါဒသည် ကျွန်ုပ်တို့၏
        အွန်လိုင်းစတိုးသို့ သင်ဝင်ရောက်ကြည့်ရှုသည့်အခါ၊ အကောင့်ဖွင့်သည့်အခါ
        သို့မဟုတ် အော်ဒါတင်သည့်အခါ{" "}
        <strong>The supplier Kaung Set</strong> (“ကျွန်ုပ်တို့”) မှ
        သင့်ကိုယ်ရေးကိုယ်တာ အချက်အလက်များကို မည်သို့ စုဆောင်းသည်၊ အသုံးပြုသည်၊
        သိမ်းဆည်းသည်၊ နှင့် မျှဝေသည်ကို ဖော်ပြထားပါသည်။
      </p>
      <p className="meta">
        နောက်ဆုံးပြင်ဆင်ခဲ့သည့်ရက်စွဲ - စက်တင်ဘာလ၊ ၂၀၂၆ ခုနှစ်
      </p>

      <h2>၁။ ကျွန်ုပ်တို့ စုဆောင်းသော အချက်အလက်များ</h2>
      <p>
        ကျွန်ုပ်တို့၏ စတိုးဆိုင်ကို လည်ပတ်ရန်နှင့် သင်၏ အော်ဒါများကို ဆောင်ရွက်ရန်
        လိုအပ်သော အချက်အလက်များကို ကျွန်ုပ်တို့ စုဆောင်းပါသည်၊ ၎င်းတို့တွင်—
      </p>
      <ul>
        <li>
          <strong>အမည်နှင့် ဆက်သွယ်ရန် အချက်အလက်များ</strong> — အမည်၊
          အီးမေးလ်လိပ်စာနှင့် ဖုန်းနံပါတ်။
        </li>
        <li>
          <strong>ပို့ဆောင်ရေး အချက်အလက်များ</strong> — ပို့ဆောင်ရမည့် လိပ်စာ၊ မြို့နှင့်
          ငွေပေးချေသည့်နေရာတွင် သင်ထည့်သွင်းပေးသော ပို့ဆောင်ရေးဆိုင်ရာ မှတ်ချက်များ။
        </li>
        <li>
          <strong>အကောင့် အချက်အလက်များ</strong> — သင်မှတ်ပုံတင်သည့်အခါ သို့မဟုတ်
          ဝင်ရောက်သည့်အခါ အသုံးပြုသည့် အကောင့်ဝင်ရောက်မှု အချက်အလက်များနှင့်
          ပရိုဖိုင်အသေးစိတ်များ (Supabase Authentication မှတစ်ဆင့် လုံခြုံစွာ
          ကိုင်တွယ်ထားပါသည်)။
        </li>
        <li>
          <strong>အော်ဒါနှင့် ငွေပေးချေမှုဆိုင်ရာ အချက်အလက်များ</strong> — ဝယ်ယူထားသော
          ပစ္စည်းများ၊ အော်ဒါ စုစုပေါင်းပမာဏ၊ tracking နံပါတ်များ၊ နှင့် လူကိုယ်တိုင်
          အတည်ပြုရန်အတွက် သင်တင်ပြသော KBZ Pay ငွေပေးချေမှု အထောက်အထား
          (transaction references) သို့မဟုတ် ငွေပေးချေမှု ပြေစာများ။ သင့်ဘဏ်ကတ်နံပါတ်
          အပြည့်အစုံကို ကျွန်ုပ်တို့ သိမ်းဆည်းထားခြင်း မရှိပါ။ KBZ Pay
          ငွေပေးချေမှုများကို QR ကုဒ်မှတစ်ဆင့် ကျွန်ုပ်တို့ ဝဘ်ဆိုက်၏ ပြင်ပတွင်
          လုပ်ဆောင်ပါသည်။
        </li>
        <li>
          <strong>အသုံးပြုမှုနှင့် ခွဲခြမ်းစိတ်ဖြာမှု အချက်အလက်များ</strong> — Google
          Analytics / Google Tag Manager မှတစ်ဆင့် စုဆောင်းရရှိသော ကြည့်ရှုခဲ့သည့်
          စာမျက်နှာများ၊ ထုတ်ကုန် ကလစ်နှိပ်မှုများနှင့် အခြားသော လမ်းကြောင်းဆိုင်ရာ
          အချက်အလက်များ။
        </li>
        <li>
          <strong>အထောက်အပံ့ ဆက်သွယ်မှုများ</strong> — ကျွန်ုပ်တို့၏ contact form
          သို့မဟုတ် WhatsApp မှတစ်ဆင့် သင်ပေးပို့သော မက်ဆေ့ချ်များ။
        </li>
      </ul>

      <h2>၂။ သင်၏ အချက်အလက်များကို အသုံးပြုပုံ</h2>
      <p>ကျွန်ုပ်တို့သည် သင်၏ အချက်အလက်များကို အောက်ပါတို့အတွက် အသုံးပြုပါသည်—</p>
      <ul>
        <li>အော်ဒါများနှင့် ပို့ဆောင်မှုများကို လုပ်ဆောင်ရန်၊ အတည်ပြုရန်နှင့် ပြီးမြောက်စေရန်။</li>
        <li>
          KBZ Pay ငွေပေးချေမှုများကို အတည်ပြုရန်နှင့် ကျွန်ုပ်တို့၏ admin tools များတွင်
          အော်ဒါ / ငွေပေးချေမှု အခြေအနေများကို အပ်ဒိတ်လုပ်ရန်။
        </li>
        <li>
          Resend မှတစ်ဆင့် ငွေပေးချေမှုနှင့် သက်ဆိုင်သော အီးမေးလ်များ (ဥပမာ-
          ပို့ဆောင်မှု အကြောင်းကြားစာများနှင့် tracking နံပါတ်များ) ပေးပို့ရန်။
        </li>
        <li>
          အော်ဒါနောက်ဆက်တွဲ ကိစ္စများအပါအဝင် WhatsApp နှင့် အီးမေးလ်တို့မှတစ်ဆင့်
          ဖောက်သည် ဝန်ဆောင်မှု ပေးရန်။
        </li>
        <li>
          အကောင့်များ၊ သစ္စာရှိဖောက်သည် အကျိုးခံစားခွင့်များ၊ ဆန္ဒစာရင်းများ
          (wishlists) နှင့် ဆက်စပ် စတိုးဆိုင်လုပ်ဆောင်ချက်များကို လည်ပတ်ရန်။
        </li>
        <li>
          အရောင်းမြှင့်တင်ရေးနှင့် မားကက်တင်းကို တိုးတက်စေရန်အတွက် Google Analytics
          ဖြင့် ဝဘ်ဆိုက် ဝင်ရောက်မှုနှင့် ထုတ်ကုန်အပေါ် စိတ်ဝင်စားမှုများကို
          ခွဲခြမ်းစိတ်ဖြာရန်။
        </li>
        <li>
          လိမ်လည်မှု၊ အလွဲသုံးစားမှုနှင့် ခွင့်ပြုချက်မရှိဘဲ ဝင်ရောက်မှုတို့မှ ကာကွယ်ရန်နှင့်
          သက်ဆိုင်ရာ ဥပဒေဆိုင်ရာ တာဝန်များကို လိုက်နာဆောင်ရွက်ရန်။
        </li>
      </ul>

      <h2>၃။ ဒေတာ သိမ်းဆည်းခြင်းနှင့် လုံခြုံရေး</h2>
      <p>
        အော်ဒါ၊ အကောင့်နှင့် ကတ်တလောက် ဒေတာများကို <strong>Supabase</strong> တွင်
        သိမ်းဆည်းထားပြီး၊ ၎င်းသည် စီမံခန့်ခွဲမှုရှိသော PostgreSQL ဒေတာဘေ့စ်၊
        authentication နှင့် ဝင်ရောက်ခွင့် ထိန်းချုပ်မှုများ (သတ်မှတ်ထားပါက row-level
        security အပါအဝင်) ကို ပံ့ပိုးပေးပါသည်။ ကိုယ်ရေးကိုယ်တာ အချက်အလက်များ
        ဆုံးရှုံးခြင်း၊ အလွဲသုံးစားလုပ်ခြင်းနှင့် ခွင့်ပြုချက်မရှိဘဲ ဝင်ရောက်ခြင်းများမှ
        ကာကွယ်ရန် ကျိုးကြောင်းဆီလျော်သော နည်းပညာနှင့် အဖွဲ့အစည်းဆိုင်ရာ အစီအမံများကို
        ကျွန်ုပ်တို့ လုပ်ဆောင်ထားပါသည်။ မည်သည့် ပေးပို့မှု သို့မဟုတ် သိမ်းဆည်းမှု
        နည်းလမ်းမျှ 100% လုံခြုံမှုမရှိနိုင်ပါ။ ထို့ကြောင့် ခိုင်မာသော စကားဝှက်ကို
        အသုံးပြုပြီး သင့်အကောင့်ဝင်ရောက်မှု အချက်အလက်များကို လျှို့ဝှက်ထားပါ။
      </p>

      <h2>၄။ ပြင်ပ ဝန်ဆောင်မှုများ</h2>
      <p>
        စတိုးဆိုင်ကို လည်ပတ်ရန် ယုံကြည်စိတ်ချရသော ဝန်ဆောင်မှုပေးသူများကို ကျွန်ုပ်တို့
        အားထားရပါသည်။ ၎င်းတို့သည် ၎င်းတို့၏ ဝန်ဆောင်မှုများ ပေးဆောင်ရန် လိုအပ်သည့်
        အတိုင်းအတာအထိသာ ဒေတာများကို လုပ်ဆောင်ပါသည်—
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — ဒေတာဘေ့စ် hosting၊ authentication နှင့်
          ဖိုင်သိမ်းဆည်းခြင်း (ဥပမာ- ငွေပေးချေမှု ပြေစာများ)။
        </li>
        <li>
          <strong>Google Analytics / Google Tag Manager</strong> — ဝဘ်ဆိုက်
          ဝင်ရောက်မှုနှင့် ထုတ်ကုန် အပြန်အလှန်တုံ့ပြန်မှုများကို ခွဲခြမ်းစိတ်ဖြာခြင်း။
        </li>
        <li>
          <strong>Resend</strong> — ငွေပေးချေမှုဆိုင်ရာ အီးမေးလ်များ ပေးပို့ခြင်း
          (အော်ဒါ / ပို့ဆောင်မှု အကြောင်းကြားစာများ)။
        </li>
        <li>
          <strong>WhatsApp</strong> — သင်စတင်ဆက်သွယ်သော သို့မဟုတ် တုံ့ပြန်သော
          ဖောက်သည် ဝန်ဆောင်မှု ဆွေးနွေးမှုများ။
        </li>
        <li>
          <strong>KBZ Pay</strong> — လူကိုယ်တိုင် QR ငွေပေးချေမှု အတည်ပြုခြင်း။
          ငွေပေးချေမှု လုပ်ငန်းစဉ်သည် KBZ Pay အက်ပ်အတွင်းတွင် KBZ ၏ ကိုယ်ပိုင်
          စည်းမျဉ်းများနှင့် ကိုယ်ရေးအချက်အလက်မူဝါဒများအတိုင်း လုပ်ဆောင်ပါသည်။
        </li>
        <li>
          <strong>ပို့ဆောင်ရေး မိတ်ဖက်များ / ကယ်ရီယာများ</strong> — သင့်အော်ဒါကို
          ပို့ဆောင်ရန် လိုအပ်သော အမည်၊ ဖုန်းနံပါတ်နှင့် လိပ်စာ။
        </li>
      </ul>
      <p>
        ဤဝန်ဆောင်မှုပေးသူများတွင် ၎င်းတို့၏ ကိုယ်ပိုင် ကိုယ်ရေးအချက်အလက်မူဝါဒများ
        ရှိပါသည်။ သင့်ကိုယ်ရေးကိုယ်တာ အချက်အလက်များကို ကျွန်ုပ်တို့ ရောင်းချမည်
        မဟုတ်ပါ။
      </p>

      <h2>၅။ ကွတ်ကီးများနှင့် ဆင်တူသော နည်းပညာများ</h2>
      <p>
        ကျွန်ုပ်တို့၏ ဝဘ်ဆိုက်နှင့် ခွဲခြမ်းစိတ်ဖြာမှု ကိရိယာများသည် (ဥပမာ- သင့်အား
        အကောင့်ဝင်ထားစေရန်၊ သင့်လှည်း (cart) ကို မှတ်သားထားရန် သို့မဟုတ်
        ဝင်ရောက်ကြည့်ရှုမှုများကို တိုင်းတာရန်) ကွတ်ကီးများ သို့မဟုတ် local storage
        ကို အသုံးပြုနိုင်ပါသည်။ သင့်ဘရောက်ဆာ ဆက်တင်များမှတစ်ဆင့် ကွတ်ကီးများကို
        ထိန်းချုပ်နိုင်ပါသည်။ အချို့သော ကွတ်ကီးများကို ပိတ်ထားပါက ဝဘ်ဆိုက်၏
        လုပ်ဆောင်ချက်များကို ထိခိုက်နိုင်ပါသည်။
      </p>

      <h2>၆။ ဒေတာ သိမ်းဆည်းထားရှိခြင်း</h2>
      <p>
        အော်ဒါများကို ဖြည့်ဆည်းပေးရန်၊ ဝန်ဆောင်မှုပေးရန်၊ စာရင်းအင်း သို့မဟုတ်
        ဥပဒေရေးရာ လိုအပ်ချက်များကို ပြည့်မီစေရန်နှင့် အငြင်းပွားမှုများကို ဖြေရှင်းရန်
        လိုအပ်သရွေ့ အော်ဒါနှင့် အကောင့် မှတ်တမ်းများကို ကျွန်ုပ်တို့ သိမ်းဆည်းထားပါမည်။
        ခွဲခြမ်းစိတ်ဖြာမှု ဒေတာများကို ကျွန်ုပ်တို့၏ Google Analytics
        သတ်မှတ်ချက်များအတိုင်း သိမ်းဆည်းထားပါမည်။
      </p>

      <h2>၇။ သင်၏ ရွေးချယ်ခွင့်များနှင့် အခွင့်အရေးများ</h2>
      <p>
        သက်ဆိုင်ရာ ဥပဒေပေါ်မူတည်၍၊ သင့်အကြောင်း ကျွန်ုပ်တို့ သိမ်းဆည်းထားသော
        ကိုယ်ရေးကိုယ်တာ ဒေတာများကို ဝင်ရောက်ကြည့်ရှုခွင့်၊ ပြင်ဆင်ခွင့်၊ သို့မဟုတ်
        ဖျက်ပစ်ခွင့်တို့ကို တောင်းဆိုနိုင်သည် သို့မဟုတ် သင့်အကောင့် အချက်အလက်များကို
        အပ်ဒိတ်လုပ်ပေးရန် တောင်းဆိုနိုင်ပါသည်။ မရှိမဖြစ် မလိုအပ်သော မားကက်တင်း
        မက်ဆေ့ချ်များကိုလည်း ပယ်ဖျက်နိုင်ပါသည်။ တောင်းဆိုမှု ပြုလုပ်ရန်
        အောက်ပါအချက်အလက်များကို အသုံးပြု၍ ဆက်သွယ်ပါ။
      </p>

      <h2>၈။ ကလေးသူငယ်များ၏ ကိုယ်ရေးအချက်အလက်</h2>
      <p>
        ကျွန်ုပ်တို့၏ စတိုးဆိုင်သည် တရားဝင် ဝယ်ယူမှုများ ပြုလုပ်နိုင်သော
        ဖောက်သည်များအတွက် ရည်ရွယ်ပါသည်။ ကလေးသူငယ်များထံမှ ကိုယ်ရေးကိုယ်တာ
        အချက်အလက်များကို ကျွန်ုပ်တို့ တမင်တကာ စုဆောင်းခြင်း မရှိပါ။ ကလေးတစ်ဦးသည်
        ကျွန်ုပ်တို့အား အချက်အလက်များ ပေးထားသည်ဟု သင်ယုံကြည်ပါက၊ ၎င်းကို
        ဖျက်ပစ်နိုင်ရန် ကျေးဇူးပြု၍ ဆက်သွယ်ပါ။
      </p>

      <h2>၉။ ဤမူဝါဒ ပြောင်းလဲခြင်း</h2>
      <p>
        ဤ ကိုယ်ရေးအချက်အလက်လုံခြုံမှုဆိုင်ရာ မူဝါဒကို အခါအားလျော်စွာ ကျွန်ုပ်တို့
        အပ်ဒိတ်လုပ်နိုင်ပါသည်။ ပြောင်းလဲမှုများ ပြုလုပ်သည့်အခါ ထိပ်ရှိ
        &quot;နောက်ဆုံးပြင်ဆင်ခဲ့သည့်ရက်စွဲ&quot; ကို ပြောင်းလဲမည်ဖြစ်ပါသည်။
        အပ်ဒိတ်လုပ်ပြီးနောက် ဝဘ်ဆိုက်ကို ဆက်လက်အသုံးပြုခြင်းသည် ပြင်ဆင်ထားသော
        မူဝါဒကို လက်ခံခြင်းကို ဆိုလိုပါသည်။
      </p>

      <h2>၁၀။ ဆက်သွယ်ရန်</h2>
      <p>
        ကိုယ်ရေးအချက်အလက်ဆိုင်ရာ မေးခွန်းများ သို့မဟုတ် တောင်းဆိုမှုများအတွက်၊{" "}
        <Link href="/contact">Contact</Link> စာမျက်နှာ၊ WhatsApp (ဝဘ်ဆိုက်တွင်
        ဖော်ပြထားသော နံပါတ်) သို့မဟုတ်{" "}
        <a href="mailto:hello@thesupplierkaungset.com">
          hello@thesupplierkaungset.com
        </a>{" "}
        သို့ အီးမေးလ်မှတစ်ဆင့် ဆက်သွယ်ပါ။
      </p>
    </>
  );
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header showSearch={false} />
      <main className="page-shell mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10 lg:px-12">
        <article className="legal-prose">
          {locale === "mm" ? <PrivacyMm /> : <PrivacyEn />}
        </article>
      </main>
    </>
  );
}
