const BOT_TOKEN = "8947026755:AAHsXbmvOJ8LbArDdHAo_qj6glBW_R4UFc4";
const ADMIN_ID = 7455286945;
const ADMIN_USERNAME = "@mybmyb00";
const CHANNEL_ID = "@MYB_studio";
const CHANNEL_LINK = "https://t.me/MYB_studio";
const WORKER_DOMAIN = "still-mud-2f7d.y1361255.workers.dev";
const CARD_NUMBER = "6219-8619-5865-8238";
const CARD_NAME = "به نام یاسین";

const BASE_PRICES = {
  "10GB": 35000,
  "20GB": 60000,
  "30GB": 90000,
  "50GB/1M": 150000,
  "50GB/2M": 170000,
  "100GB": 320000,
  "Unlimited/20D": 150000,
  "Unlimited/1M": 190000,
  "Unlimited/2M": 350000,
  "Unlimited/3M": 490000,
};

const STATIC_LOCATIONS = [
  "USA-Virginia",
  "USA-California",
  "Netherlands-Amsterdam",
  "Singapore",
];

const LOCATION_FLAGS = {
  "USA-Virginia": "🇺🇸",
  "USA-California": "🇺🇸",
  "Netherlands-Amsterdam": "🇳🇱",
  "Singapore": "🇸🇬",
};

// نگهداری سشن کاربران و ادمین
const userSessions = new Map();

const api = (method, body) =>
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());

const sendMsg = (chatId, text, extra = {}) =>
  api("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", ...extra });

const editMsg = (chatId, messageId, text, extra = {}) =>
  api("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    ...extra,
  });

const answerCb = (id, text = "") =>
  api("answerCallbackQuery", { callback_query_id: id, text });

const getMember = (chatId, userId) =>
  api("getChatMember", { chat_id: chatId, user_id: userId });

const forwardMsg = (toChatId, fromChatId, messageId) =>
  api("forwardMessage", {
    chat_id: toChatId,
    from_chat_id: fromChatId,
    message_id: messageId,
  });

const fmtPrice = (n) => n.toLocaleString("en-US");

const formatServiceName = (type, location, volume) => {
  const t = type === "normal" ? "Normal" : "Static";
  const l = location === "Germany" ? "Germany" : location;
  return `Silent-${t}-${l}-${volume}`;
};

const keyboards = {
  joinChannel: () => ({
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "🔗 عضویت در کانال", url: CHANNEL_LINK }],
        [{ text: "✅ تایید عضویت و ورود به ربات", callback_data: "verify_member" }],
      ],
    }),
  }),
  mainMenu: () => ({
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "🛒 خرید سرویس جدید", callback_data: "buy_new" }],
      ],
    }),
  }),
  serviceType: () => ({
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "🇩🇪 سرویس معمولی (آلمان - آی‌پی متغیر)", callback_data: "type_normal" }],
        [{ text: "🌐 سرویس‌های آی‌پی ثابت", callback_data: "type_static" }],
      ],
    }),
  }),
  staticLocations: () => ({
    reply_markup: JSON.stringify({
      inline_keyboard: STATIC_LOCATIONS.map((loc) => [
        { text: `${LOCATION_FLAGS[loc]} ${loc}`, callback_data: `loc_${loc}` },
      ]),
    }),
  }),
  volumeSelection: (serviceType) => {
    const volumeTranslations = {
      "10GB": "۱۰ گیگابایت (۱ ماهه)",
      "20GB": "۲۰ گیگابایت (۱ ماهه)",
      "30GB": "۳۰ گیگابایت (۱ ماهه)",
      "50GB/1M": "۵۰ گیگابایت (۱ ماهه)",
      "50GB/2M": "۵۰ گیگابایت (۲ ماهه)",
      "100GB": "۱۰۰ گیگابایت (۲ ماهه)",
      "Unlimited/20D": "نامحدود (۲۰ روزه)",
      "Unlimited/1M": "نامحدود (۱ ماهه)",
      "Unlimited/2M": "نامحدود (۲ ماهه)",
      "Unlimited/3M": "نامحدود (۳ ماهه)"
    };

    const rows = Object.entries(BASE_PRICES).map(([vol, base]) => {
      const price = serviceType === "static" ? Math.round(base * 1.1) : base;
      const textFarsi = volumeTranslations[vol] || vol;
      return [{ text: `${textFarsi} — ${fmtPrice(price)} تومان`, callback_data: `vol_${vol}` }];
    });
    rows.push([{ text: "🔙 بازگشت", callback_data: "back_main" }]);
    return { reply_markup: JSON.stringify({ inline_keyboard: rows }) };
  },
  adminAction: (userId, serviceName) => ({
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: "✅ تایید و ارسال کانفیگ دستی", callback_data: `ap:${userId}:${encodeURIComponent(serviceName)}` },
          { text: "❌ رد سرویس", callback_data: `rj_${userId}` },
        ],
      ],
    }),
  }),
};

async function handleStart(chatId, userId) {
  const res = await getMember(CHANNEL_ID, userId);
  const status = res.result?.status;
  const isMember = ["member", "administrator", "creator"].includes(status);

  if (!isMember && userId !== ADMIN_ID) {
    await sendMsg(
      chatId,
      "⚠️ لطفاً ابتدا در کانال ما عضو شید سپس دکمه تایید را بزنید:",
      keyboards.joinChannel()
    );
    return;
  }

  userSessions.set(userId, { step: "main_menu" });
  await sendMsg(chatId, "🎉 به ربات خوش آمدید!", keyboards.mainMenu());
}

async function handleVerifyMember(chatId, userId, messageId) {
  const res = await getMember(CHANNEL_ID, userId);
  const status = res.result?.status;
  const isMember = ["member", "administrator", "creator"].includes(status);

  if (!isMember) {
    await answerCb("❌ هنوز عضو نشدید! لطفاً ابتدا عضو شید.");
    return;
  }

  await editMsg(chatId, messageId, "✅ عضویت تایید شد!");
  userSessions.set(userId, { step: "main_menu" });
  await sendMsg(chatId, "🎉 به ربات خوش آمدید!", keyboards.mainMenu());
}

async function handleBuyNew(chatId, userId, messageId) {
  userSessions.set(userId, { step: "choose_type" });
  await editMsg(chatId, messageId, "🌍 نوع سرویس مورد نظر را انتخاب کنید:", keyboards.serviceType());
}

async function handleServiceType(chatId, userId, messageId, type) {
  if (type === "normal") {
    userSessions.set(userId, { step: "choose_volume", serviceType: "normal", location: "Germany" });
    await editMsg(
      chatId,
      messageId,
      "📦 حجم سرویس معمولی (آلمان) را انتخاب کنید:",
      keyboards.volumeSelection("normal")
    );
  } else {
    userSessions.set(userId, { step: "choose_static_location", serviceType: "static" });
    await editMsg(chatId, messageId, "🌍 موقعیت سرویس آی‌پی ثابت را انتخاب کنید:", keyboards.staticLocations());
  }
}

async function handleLocation(chatId, userId, messageId, location) {
  userSessions.set(userId, { step: "choose_volume", serviceType: "static", location });
  await editMsg(
    chatId,
    messageId,
    `📦 حجم سرویس آی‌پی ثابت (${location}) را انتخاب کنید:`,
    keyboards.volumeSelection("static")
  );
}

async function handleVolume(chatId, userId, messageId, volume) {
  const session = userSessions.get(userId);
  if (!session) return;

  const basePrice = BASE_PRICES[volume];
  if (!basePrice) return;

  const price = session.serviceType === "static" ? Math.round(basePrice * 1.1) : basePrice;
  const serviceName = formatServiceName(session.serviceType, session.location, volume);

  session.step = "awaiting_receipt";
  session.volume = volume;
  session.price = price;
  session.serviceName = serviceName;

  const volumeTranslations = {
    "10GB": "۱۰ گیگابایت (۱ ماهه)",
    "20GB": "۲۰ گیگابایت (۱ ماهه)",
    "30GB": "۳۰ گیگابایت (۱ ماهه)",
    "50GB/1M": "۵۰ گیگابایت (۱ ماهه)",
    "50GB/2M": "۵۰ گیگابایت (۲ ماهه)",
    "100GB": "۱۰۰ گیگابایت (۲ ماهه)",
    "Unlimited/20D": "نامحدود (۲۰ روزه)",
    "Unlimited/1M": "نامحدود (۱ ماهه)",
    "Unlimited/2M": "نامحدود (۲ ماهه)",
    "Unlimited/3M": "نامحدود (۳ ماهه)"
  };

  const نوعسرویس = session.serviceType === "normal" ? "معمولی (آلمان - آی‌پي متغیر)" : "آی‌پی ثابت";
  const موقعیتسرویس = session.location === "Germany" ? "آلمان" : session.location;
  const حجمفارسی = volumeTranslations[volume] || volume;

  const invoiceText = [
    `🧾 <b>فاکتور خرید سرویس</b>`,
    ``,
    `📦 نام فنی سرویس: <code>${serviceName}</code>`,
    `🌍 نوع سرویس: <b>${نوعسرویس}</b>`,
    `📍 موقعیت سرور: <b>${موقعیتسرویس}</b>`,
    `💾 حجم اکانت: <b>${حجمفارسی}</b>`,
    `💰 مبلغ قابل پرداخت: <b>${fmtPrice(price)} تومان</b>`,
    ``,
    `💳 شماره کارت جهت واریز: <code>${CARD_NUMBER}</code>`,
    `👤 ${CARD_NAME}`,
    ``,
    `📸 لطفاً پس از واریز، تصویر فیش (رسید) خود را در همین‌جا ارسال کنید:`,
  ].join("\n");

  await editMsg(chatId, messageId, invoiceText);
}

async function handleReceipt(chatId, userId, messageId, photo) {
  const session = userSessions.get(userId);
  if (!session || session.step !== "awaiting_receipt") return;

  session.step = "done";

  const caption = [
    `🧾 <b>درخواست خرید جدید</b>`,
    ``,
    `👤 User ID: <code>${userId}</code>`,
    `💬 Chat ID: <code>${chatId}</code>`,
    `📦 نام سرویس: <code>${session.serviceName}</code>`,
    `🌍 نوع: ${session.serviceType === "normal" ? "معمولی" : "آی‌پی ثابت"}`,
    `📍 موقعیت: ${session.location}`,
    `💾 حجم: ${session.volume}`,
    `💰 مبلغ: ${fmtPrice(session.price)} تومان`,
  ].join("\n");

  await forwardMsg(ADMIN_ID, chatId, messageId);
  await sendMsg(ADMIN_ID, caption, keyboards.adminAction(userId, session.serviceName));
  await sendMsg(chatId, "✅ فیش واریزی شما به ادمین ارسال شد. لطفاً منتظر تایید باشید.");
}

// وقتی ادمین دکمه تایید رو می‌زنه، ربات فقط وضعیت ادمین رو منتظر گرفتن متن کانفیگ می‌کنه
async function handleApprove(chatId, messageId, buyerId, serviceName) {
  // ۱. تغییر وضعیت ادمین برای دریافت کانفیگ دستی
  userSessions.set(ADMIN_ID, {
    step: "admin_entering_config",
    buyerId: buyerId,
    serviceName: serviceName,
  });

  // ۲. فرستادن پیام راهنما به ادمین
  await editMsg(
    chatId,
    messageId,
    `✍️ <b>رسید کاربر تایید شد!</b>\n\nحالا لطفاً متن کانفیگ دستی (شامل لینک ساب و کانفیگ VLESS) را در یک پیام بنویسید و همینجا ارسال کنید تا برای خریدار ارسال شود:\n\n👤 یوزرآیدی خریدار: <code>${buyerId}</code>\n📦 سرویس: <code>${serviceName}</code>`
  );
}

async function handleReject(chatId, messageId, buyerId) {
  await sendMsg(buyerId, "❌ متأسفانه سفارش شما به دلیل عدم تایید فیش واریزی رد شد. لطفاً در صورت وجود مشکل با پشتیبانی در ارتباط باشید.");
  await editMsg(chatId, messageId, `❌ سرویس کاربر ${buyerId} رد شد.`);
  userSessions.delete(buyerId);
}

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const text = msg.text;

  if (text === "/start") {
    await handleStart(chatId, userId);
    return;
  }

  // بررسی وضعیت ادمین برای ارسال دستی کانفیگ
  if (userId === ADMIN_ID) {
    const adminSession = userSessions.get(ADMIN_ID);
    if (adminSession && adminSession.step === "admin_entering_config") {
      const buyerId = adminSession.buyerId;
      const sName = adminSession.serviceName;

      if (!text) {
        await sendMsg(ADMIN_ID, "⚠️ لطفاً کانفیگ را به صورت متن ارسال کنید.");
        return;
      }

      // فرستادن متن دقیق ادمین برای مشتری
      await sendMsg(buyerId, text);
      
      // مطلع کردن خریدار از تایید نهایی
      await sendMsg(buyerId, `✅ سرویس شما با موفقیت فعال شد و اطلاعات بالا متعلق به اکانت شماست.`);

      // تایید به ادمین
      await sendMsg(ADMIN_ID, `🚀 کانفیگ دستی شما با موفقیت برای خریدار (${buyerId}) ارسال شد.`);
      
      userSessions.delete(ADMIN_ID);
      userSessions.delete(buyerId);
      return;
    }
  }

  const session = userSessions.get(userId);
  if (!session) return;

  if (session.step === "awaiting_receipt" && msg.photo) {
    const photo = msg.photo[msg.photo.length - 1].file_id;
    await handleReceipt(chatId, userId, msg.message_id, photo);
    return;
  }

  if (session.step === "awaiting_receipt" && !msg.photo) {
    await sendMsg(chatId, "⚠️ لطفاً یک تصویر فیش واریزی ارسال کنید.");
    return;
  }
}

async function handleCallback(cb) {
  const chatId = cb.message.chat.id;
  const userId = cb.from.id;
  const messageId = cb.message.message_id;
  const data = cb.data;

  if (data === "verify_member") {
    await handleVerifyMember(chatId, userId, messageId);
    return;
  }

  if (data === "buy_new") {
    await handleBuyNew(chatId, userId, messageId);
    return;
  }

  if (data === "back_main") {
    userSessions.set(userId, { step: "main_menu" });
    await editMsg(chatId, messageId, "🎉 به ربات خوش آمدید!", keyboards.mainMenu());
    await answerCb(cb.id);
    return;
  }

  if (data === "type_normal" || data === "type_static") {
    const type = data === "type_normal" ? "normal" : "static";
    await handleServiceType(chatId, userId, messageId, type);
    await answerCb(cb.id);
    return;
  }

  if (data.startsWith("loc_")) {
    const location = data.slice(4);
    await handleLocation(chatId, userId, messageId, location);
    await answerCb(cb.id);
    return;
  }

  if (data.startsWith("vol_")) {
    const volume = data.slice(4);
    await handleVolume(chatId, userId, messageId, volume);
    await answerCb(cb.id);
    return;
  }

  if (data.startsWith("ap:")) {
    if (userId !== ADMIN_ID) {
      await answerCb(cb.id, "⚠️ فقط ادمین می‌تواند سرویس را تایید کند.");
      return;
    }
    const parts = data.split(":");
    const buyerId = parseInt(parts[1], 10);
    const serviceName = decodeURIComponent(parts[2]);
    
    await handleApprove(chatId, messageId, buyerId, serviceName);
    await answerCb(cb.id);
    return;
  }

  if (data.startsWith("rj_")) {
    const buyerId = parseInt(data.slice(3), 10);
    if (userId !== ADMIN_ID) {
      await answerCb(cb.id, "⚠️ فقط ادمین می‌تواند سرویس را رد کند.");
      return;
    }
    await handleReject(chatId, messageId, buyerId);
    await answerCb(cb.id);
    return;
  }

  await answerCb(cb.id);
}

async function setWebhook() {
  const url = `https://${WORKER_DOMAIN}/`;
  const res = await api("setWebhook", { url, allowed_updates: ["message", "callback_query"] });
  return res;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/setWebhook") {
      const result = await setWebhook();
      return new Response(JSON.stringify(result, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/" && request.method === "GET") {
      return new Response("Silent VPN Bot is running.", { status: 200 });
    }

    if (request.method === "POST") {
      try {
        const update = await request.json();

        if (update.message) {
          await handleMessage(update.message);
        } else if (update.callback_query) {
          await handleCallback(update.callback_query);
        }

        return new Response("OK", { status: 200 });
      } catch (err) {
        console.error("Error:", err);
        return new Response("Error", { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};
