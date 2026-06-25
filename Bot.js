export default {
  async fetch(request, env) {
    const BOT_TOKEN = "8947026755:AAHsXbmvOJ8LbArDdHAo_qj6glBW_R4UFc4";
    const ADMIN_ID = 7455286945;
    const ADMIN_USERNAME = "@mybmyb00";
    const CHANNEL_ID = "@MYB_studio";
    const TG = `https://api.telegram.org/bot${BOT_TOKEN}`;

    // حافظه موقت کلاودفلر (KV نیست، اما برای ذخیره موقت مراحل لوکیشن کاربر در لحظه خرید کار میکنه)
    // برای پایداری بیشتر، متغیرها در سطح گلوبال یا استیت نگه داشته میشوند.
    if (!globalThis.userSelection) {
      globalThis.userSelection = {};
    }

    const sendMessage = async (chat_id, text, extra = {}) => {
      return fetch(`${TG}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id,
          text,
          parse_mode: "Markdown",
          ...extra,
        }),
      });
    };

    const editMessageText = async (chat_id, message_id, text, extra = {}) => {
      return fetch(`${TG}/editMessageText`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id,
          message_id,
          text,
          parse_mode: "Markdown",
          ...extra,
        }),
      });
    };

    const sendPhoto = async (chat_id, photo, caption, extra = {}) => {
      return fetch(`${TG}/sendPhoto`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id,
          photo,
          caption,
          parse_mode: "Markdown",
          ...extra,
        }),
      });
    };

    const answerCallbackQuery = async (callback_query_id, text = "", show_alert = false) => {
      return fetch(`${TG}/answerCallbackQuery`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          callback_query_id,
          text,
          show_alert
        }),
      });
    };

    const checkChannelMembership = async (user_id) => {
      try {
        const res = await fetch(`${TG}/getChatMember?chat_id=${CHANNEL_ID}&user_id=${user_id}`);
        const data = await res.json();
        if (data.ok && data.result) {
          const status = data.result.status;
          return ["member", "administrator", "creator"].includes(status);
        }
        return false;
      } catch (e) {
        return false;
      }
    };

    // منوی اصلی جدید یاسین
    const mainKeyboard = {
      keyboard: [
        [{ text: "🛒 خرید سرویس جدید" }],
        [{ text: "⚡ تست رایگان" }, { text: "💡 آموزش اتصال" }],
        [{ text: "📞 پشتیبانی و ارسال رسید" }],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    };

    const backKeyboard = {
      keyboard: [[{ text: "🔙 بازگشت به منوی اصلی" }]],
      resize_keyboard: true,
      one_time_keyboard: false,
    };

    const joinInlineKeyboard = {
      inline_keyboard: [
        [{ text: "📢 ورود به کانال سایلنت وی‌پی‌ان", url: `https://t.me/MYB_studio` }],
        [{ text: "✅ تایید عضویت و ورود به ربات", callback_data: "check_join" }]
      ]
    };

    // کیبورد انتخاب لوکیشن / کشورها
    const countryKeyboard = {
      inline_keyboard: [
        [{ text: "🇺🇸 آمریکا - ویرجینیا", callback_data: "set_country:USA-Virginia" }],
        [{ text: "🇺🇸 آمریکا - کالیفرنیا", callback_data: "set_country:USA-California" }],
        [{ text: "🇳🇱 هلند - آمستردام", callback_data: "set_country:Netherlands-Amsterdam" }],
        [{ text: "🇸🇬 سنگاپور", callback_data: "set_country:Singapore" }]
      ]
    };

    // کیبورد انتخاب حجم‌ها (هر حجم یک دکمه مجزا)
    const volumeKeyboard = {
      inline_keyboard: [
        [{ text: "💾 اکانت ۱۰ گیگابایت (۱ ماهه) - ۳۵,۰۰۰ تومان", callback_data: "set_vol:10GB-1M" }],
        [{ text: "💾 اکانت ۲۰ گیگابایت (۱ ماهه) - ۶۰,۰۰0 تومان", callback_data: "set_vol:20GB-1M" }],
        [{ text: "💾 اکانت ۳۰ گیگابایت (۱ ماهه) - ۹۰,۰۰۰ تومان", callback_data: "set_vol:30GB-1M" }],
        [{ text: "💾 اکانت ۵۰ گیگابایت (۱ ماهه) - ۱۵۰,۰۰0 تومان", callback_data: "set_vol:50GB-1M" }],
        [{ text: "💾 اکانت ۵۰ گیگابایت (۲ ماهه) - ۱۷۰,۰۰0 تومان", callback_data: "set_vol:50GB-2M" }],
        [{ text: "💾 اکانت ۱۰۰ گیگابایت (۲ ماهه) - ۳۲۰,۰۰0 تومان", callback_data: "set_vol:100GB-2M" }],
        [{ text: "♾️ اکانت نامحدود (۲۰ روزه) - ۱۵۰,۰۰۰ تومان", callback_data: "set_vol:Unlimited-20D" }],
        [{ text: "♾️ اکانت نامحدود (۱ ماهه) - ۱۹۰,۰۰۰ تومان", callback_data: "set_vol:Unlimited-1M" }],
        [{ text: "♾️ اکانت نامحدود (۲ ماهه) - ۳۵۰,۰۰۰ تومان", callback_data: "set_vol:Unlimited-2M" }],
        [{ text: "♾️ اکانت نامحدود (۳ ماهه) - ۴۹۰,۰۰۰ تومان", callback_data: "set_vol:Unlimited-3M" }]
      ]
    };

    const platformKeyboard = {
      inline_keyboard: [
        [{ text: "🤖 اندروید (Android)", callback_data: "guide_android" }],
        [{ text: "🪟 ویندوز (Windows)", callback_data: "guide_windows" }],
        [{ text: "🍎 آیفون (iOS)", callback_data: "guide_ios" }],
        [{ text: "💻 مک (macOS)", callback_data: "guide_macos" }]
      ]
    };

    const warningText = `\n\n⚠️ **نکته بسیار مهم:** لطفا فقط از نرم‌افزارهای پیشنهادی فوق استفاده کنید. در صورت استفاده از برنامه‌های متفرقه دیگر، ما هیچ مسئولیتی را گردن نمی‌گیریم!`;

    try {
      if (request.method !== "POST") return new Response("OK");
      const update = await request.json();

      if (update.message) {
        const msg = update.message;
        const chatId = msg.chat?.id;
        const userId = msg.from?.id;
        const text = msg.text || "";

        if (userId !== ADMIN_ID) {
          const isMember = await checkChannelMembership(userId);
          if (!isMember) {
            await sendMessage(
              chatId,
              `⚠️ **رفیق برای استفاده از ربات، اول باید عضو کانال ما بشی!**\n\nعضویت شما باعث دلگرمی ماست و اخبار قطعی یا کانفیگ‌های جدید رو اونجا می‌ذاریم.👇`,
              { reply_markup: joinInlineKeyboard }
            );
            return new Response("OK");
          }
        }

        // منوی ارسال رسید با دریافت لوکیشن و حجم مشخص شده
        if (msg.photo && msg.photo.length > 0) {
          const bestPhoto = msg.photo[msg.photo.length - 1];
          
          // خواندن لوکیشن و حجمی که کاربر دکمه‌اش رو زده بود
          const session = globalThis.userSelection[userId] || { country: "نامشخص", volume: "نامشخص" };
          const serviceName = `Silent-${session.country}-${session.volume}`;

          await sendPhoto(
            ADMIN_ID,
            bestPhoto.file_id,
            `🧾 *رسید جدید دریافت شد (لیست کامل مشخصات سفارش)*\n\n` +
            `👤 کاربر: \`${userId}\`\n` +
            `💬 چت‌آیدی: \`${chatId}\`\n` +
            `📍 کشور/لوکیشن خریدار: *${session.country}*\n` +
            `💾 حجم درخواستی: *${session.volume}*\n` +
            `🏷️ نام پیشنهادی سرویس: \`${serviceName}\`\n\n` +
            `برای تایید یا رد، از دکمه‌های زیر استفاده کن.`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "✅ تایید", callback_data: `approve:${chatId}:${serviceName}` },
                    { text: "❌ رد سرویس", callback_data: `reject:${chatId}:${serviceName}` },
                  ],
                ],
              },
            }
          );

          await sendMessage(chatId, "عالیه رفیق ✅\nرسیدت دریافت شد و برای بررسی فرستاده شد.");
          return new Response("OK");
        }

        if (text.startsWith("/start") || text === "🔙 بازگشت به منوی اصلی") {
          await sendMessage(
            chatId,
            "سلام رفیق 👋\nبه ربات خرید سرویس خوش اومدی.\n\nاز منو یکی رو انتخاب کن:",
            { reply_markup: mainKeyboard }
          );
          return new Response("OK");
        }

        // بخش جدید: زدن دکمه خرید سرویس و پرسیدن کشور
        if (text === "🛒 خرید سرویس جدید") {
          globalThis.userSelection[userId] = { country: "نامشخص", volume: "نامشخص" };
          await sendMessage(chatId, "🌐 **مرحله اول: لطفاً کشور و لوکیشن مورد نظرت رو انتخاب کن:**", {
            reply_markup: countryKeyboard
          });
          return new Response("OK");
        }

        if (text === "💡 آموزش اتصال") {
          await sendMessage(chatId, "📱 **لطفاً پلتفرم یا سیستم‌عامل خودت رو انتخاب کن:**", {
            reply_markup: platformKeyboard
          });
          return new Response("OK");
        }

        if (text === "⚡ تست رایگان") {
          await sendMessage(
            chatId,
            `⚡ *تست رایگان*\n\n🧪 برای اطمینان از سرعت و کیفیت، اکانت تست با اعتبار محدود موجود است.\n\n📩 جهت دریافت تست به پیام دهید:\n🆔 ${ADMIN_USERNAME}`,
            { reply_markup: backKeyboard }
          );
          return new Response("OK");
        }

        if (text === "📞 پشتیبانی و ارسال رسید") {
          await sendMessage(
            chatId,
            `📞 *پشتیبانی*\n\nپیام‌ها یا سوالاتت رو همینجا بفرست.\nادمین پشتیبانی: ${ADMIN_USERNAME}`,
            { reply_markup: backKeyboard }
          );
          return new Response("OK");
        }

        if (text.startsWith("ارسال:") && userId === ADMIN_ID) {
          const parts = text.split(":");
          const targetChatId = parts[1];
          const configText = parts.slice(2).join(":");

          if (targetChatId && configText) {
            await sendMessage(
              targetChatId,
              `✅ *سرویس شما آماده شد*\n\nکانفیگ:\n\`\`\`\n${configText}\n\`\`\``
            );
            await sendMessage(
              ADMIN_ID,
              `ارسال شد به \`${targetChatId}\`\n\nدستور استفاده شد:\n\`ارسال:${targetChatId}:کانفیگ\``
            );
          } else {
            await sendMessage(ADMIN_ID, "❌ فرمت دستور درست نیست.\n\nفرمت صحیح:\n`ارسال:چت‌آیدی:کانفیگ`");
          }
          return new Response("OK");
        }

        return new Response("OK");
      }

      if (update.callback_query) {
        const cq = update.callback_query;
        const data = cq.data || "";
        const callbackId = cq.id;
        const fromId = cq.from?.id;
        const messageId = cq.message?.message_id;
        const chatId = cq.message?.chat?.id;

        // ذخیره کشور انتخاب شده و بردن کاربر به مرحله انتخاب حجم
        if (data.startsWith("set_country:")) {
          const country = data.split(":")[1];
          if (!globalThis.userSelection[fromId]) globalThis.userSelection[fromId] = {};
          globalThis.userSelection[fromId].country = country;

          await answerCallbackQuery(callbackId, `لوکیشن ${country} انتخاب شد.`);
          await editMessageText(chatId, messageId, `📍 لوکیشن انتخاب شده: *${country}*\n\n💾 **مرحله دوم: حالا حجم اکانت مد نظرت رو انتخاب کن:**`, {
            reply_markup: volumeKeyboard
          });
          return new Response("OK");
        }

        // ذخیره حجم انتخاب شده و نمایش کارت و راهنمای واریز به کاربر
        if (data.startsWith("set_vol:")) {
          const volume = data.split(":")[1];
          if (!globalThis.userSelection[fromId]) globalThis.userSelection[fromId] = {};
          globalThis.userSelection[fromId].volume = volume;

          await answerCallbackQuery(callbackId, "حجم ثبت شد.");
          
          const country = globalThis.userSelection[fromId].country || "نامشخص";
          const invoiceText = `🌐✨ **سرویس سوپر استارلینک**\n\n` +
            `📍 لوکیشن انتخابی شما: *${country}*\n` +
            `💾 حجم انتخابی شما: *${volume}*\n\n` +
            `⏳📈 *فروش با این قیمت‌های پایین محدوده و ظرف یک هفته آینده افزایش قیمت خواهد داشت.*\n\n` +
            `💳 **شماره کارت واریز:**\n\`6219-8619-5865-8238\`\nبه نام یاسین\n\n` +
            `👇 **حالا لطفاً عکس رسید واریز خودت رو همینجا بفرست تا سرویس برات صادر بشه.**`;

          await editMessageText(chatId, messageId, invoiceText);
          await sendMessage(chatId, "منتظر ارسال رسیدت هستیم... 👇", { reply_markup: backKeyboard });
          return new Response("OK");
        }

        if (data === "back_to_platforms") {
          await answerCallbackQuery(callbackId);
          await editMessageText(chatId, messageId, "📱 **لطفاً پلتفرم یا سیستم‌عامل خودت رو انتخاب کن:**", {
            reply_markup: platformKeyboard
          });
          return new Response("OK");
        }

        if (data === "guide_android") {
          await answerCallbackQuery(callbackId);
          const text = `🤖 **کلاینت‌های پیشنهادی اندروید (Android):**` + warningText;
          await editMessageText(chatId, messageId, text, {
            reply_markup: {
              inline_keyboard: [
                [{ text: "📥 دانلود v2rayNG", url: "https://github.com/2dust/v2rayNG/releases" }, { text: "📖 آموزش v2rayNG", callback_data: "learn_v2rayng" }],
                [{ text: "📥 دانلود Hiddify", url: "https://github.com/hiddify/hiddify-next/releases" }, { text: "📖 آموزش Hiddify", callback_data: "learn_hiddify" }],
                [{ text: "📥 دانلود NekoBox", url: "https://github.com/MatsuriDayo/NekoBoxForAndroid/releases" }, { text: "📖 آموزش NekoBox", callback_data: "learn_nekobox" }],
                [{ text: "🔙 بازگشت", callback_data: "back_to_platforms" }]
              ]
            }
          });
          return new Response("OK");
        }

        if (data === "guide_windows") {
          await answerCallbackQuery(callbackId);
          const text = `🪟 **کلاینت‌های پیشنهادی ویندوز (Windows):**` + warningText;
          await editMessageText(chatId, messageId, text, {
            reply_markup: {
              inline_keyboard: [
                [{ text: "📥 دانلود v2rayN", url: "https://github.com/2dust/v2rayN/releases" }, { text: "📖 آموزش v2rayN", callback_data: "learn_v2rayn" }],
                [{ text: "📥 دانلود Hiddify", url: "https://github.com/hiddify/hiddify-next/releases" }, { text: "📖 آموزش Hiddify", callback_data: "learn_hiddify" }],
                [{ text: "📥 دانلود Clash Verge", url: "https://github.com/clash-verge-rev/clash-verge-rev/releases" }, { text: "📖 آموزش Clash Verge", callback_data: "learn_clash" }],
                [{ text: "🔙 بازگشت", callback_data: "back_to_platforms" }]
              ]
            }
          });
          return new Response("OK");
        }

        if (data === "guide_ios") {
          await answerCallbackQuery(callbackId);
          const text = `🍎 **کلاینت‌های پیشنهادی آیفون (iOS):**\n\n*(برنامه‌های آیفون در اپ‌استور هستند)*` + warningText;
          await editMessageText(chatId, messageId, text, {
            reply_markup: {
              inline_keyboard: [
                [{ text: "🍏 Shadowrocket", url: "https://apps.apple.com/us/app/shadowrocket/id932747118" }, { text: "📖 آموزش", callback_data: "learn_shadowrocket" }],
                [{ text: "🍏 Streisand", url: "https://apps.apple.com/us/app/streisand/id6450534064" }, { text: "📖 آموزش", callback_data: "learn_streisand" }],
                [{ text: "🍏 Stash", url: "https://apps.apple.com/us/app/stash-rule-based-proxy-client/id1596063349" }, { text: "📖 آموزش", callback_data: "learn_stash" }],
                [{ text: "🔙 بازگشت", callback_data: "back_to_platforms" }]
              ]
            }
          });
          return new Response("OK");
        }

        if (data === "guide_macos") {
          await answerCallbackQuery(callbackId);
          const text = `💻 **کلاینت‌های پیشنهادی مک (macOS):**` + warningText;
          await editMessageText(chatId, messageId, text, {
            reply_markup: {
              inline_keyboard: [
                [{ text: "📥 دانلود Clash Verge", url: "https://github.com/clash-verge-rev/clash-verge-rev/releases" }, { text: "📖 آموزش Clash Verge", callback_data: "learn_clash" }],
                [{ text: "📥 دانلود Hiddify", url: "https://github.com/hiddify/hiddify-next/releases" }, { text: "📖 آموزش Hiddify", callback_data: "learn_hiddify" }],
                [{ text: "🔙 بازگشت", callback_data: "back_to_platforms" }]
              ]
            }
          });
          return new Response("OK");
        }

        if (data === "learn_v2rayng") {
          await answerCallbackQuery(callbackId);
          await editMessageText(chatId, messageId, `📖 **آموزش اتصال با v2rayNG (اندروید):**\n\n۱. کانفیگ خود را کامل کپی کنید.\n۲. وارد برنامه شده و روی علامت + بالای صفحه بزنید.\n۳. گزینه **Import config from Clipboard** را انتخاب کنید.\n۴. روی کانفیگ اضافه شده بزنید و دکمه دایره‌ای پایین صفحه را لمس کنید تا متصل شوید. 🚀`, {
            reply_markup: { inline_keyboard: [[{ text: "🔙 بازگشت به منو", callback_data: "guide_android" }]] }
          });
          return new Response("OK");
        }

        if (data === "learn_hiddify") {
          await answerCallbackQuery(callbackId);
          await editMessageText(chatId, messageId, `📖 **آموزش اتصال با Hiddify (همه پلتفرم‌ها):**\n\n۱. کانفیگ را کپی کنید.\n۲. برنامه هیدیفای را باز کرده و دکمه **➕ افزودن کانفیگ** یا (New Profile) را بزنید.\n۳. گزینه **افزودن از حافظه موقت (Clipboard)** را انتخاب کنید.\n۴. دکمه دایره بزرگ وسط صفحه را بزنید تا سبز و متصل شود. 🔥`, {
            reply_markup: { inline_keyboard: [[{ text: "🔙 بازگشت به منوی اصلی پلتفرم‌ها", callback_data: "back_to_platforms" }]] }
          });
          return new Response("OK");
        }

        if (data === "learn_nekobox") {
          await answerCallbackQuery(callbackId);
          await editMessageText(chatId, messageId, `📖 **آموزش اتصال با NekoBox (اندروید):**\n\n۱. کانفیگ را کپی کنید.\n۲. وارد برنامه شوید و علامت آیکون کاغذ/پلاس بالا را بزنید.\n۳. گزینه **Import from Clipboard** را انتخاب کنید.\n۴. پروفایل ایجاد شده را انتخاب کرده و آیکون اتصال پایین را بزنید. ⚡`, {
            reply_markup: { inline_keyboard: [[{ text: "🔙 بازگشت به منو", callback_data: "guide_android" }]] }
          });
          return new Response("OK");
        }

        if (data === "learn_v2rayn") {
          await answerCallbackQuery(callbackId);
          await editMessageText(chatId, messageId, `📖 **آموزش اتصال با v2rayN (ویندوز):**\n\n۱. کانفیگ را کپی کنید.\n۲. برنامه را باز کرده و کلیدهای ترکیبی **Ctrl + V** را بزنید تا کانفیگ وارد شود.\n۳. روی کانفیگ راست کلیک کرده و **Set as active server** را بزنید.\n۴. پایین سمت راست ویندوز روی آیکون برنامه راست کلیک کرده و در بخش System Proxy گزینه **Clear system proxy** یا **Global** را انتخاب کنید. 💻`, {
            reply_markup: { inline_keyboard: [[{ text: "🔙 بازگشت به منو", callback_data: "guide_windows" }]] }
          });
          return new Response("OK");
        }

        if (data === "learn_clash") {
          await answerCallbackQuery(callbackId);
          await editMessageText(chatId, messageId, `📖 **آموزش اتصال با Clash Verge (ویندوز/مک):**\n\n۱. کانفیگ را کپی کنید.\n۲. در برنامه به بخش **Profiles** بروید.\n۳. لینک یا متد کانفیگ را وارد کرده و Import را بزنید.\n۴. به بخش Proxies بروید، سرور را انتخاب کنید و گزینه **System Proxy** را در منوی اصلی فعال کنید. ⚙️`, {
            reply_markup: { inline_keyboard: [[{ text: "🔙 بازگشت به منوی اصلی پلتفرم‌ها", callback_data: "back_to_platforms" }]] }
          });
          return new Response("OK");
        }

        if (data === "learn_shadowrocket" || data === "learn_streisand" || data === "learn_stash") {
          await answerCallbackQuery(callbackId);
          await editMessageText(chatId, messageId, `📖 **آموزش اتصال در آیفون (iOS):**\n\n۱. کانفیگ دریافتی را کامل کپی کنید.\n۲. نرم‌افزار مورد نظر را باز کنید؛ معمولاً برنامه به صورت خودکار تشخیص می‌دهد و پیام **Add from Clipboard** باز می‌شود که باید تایید کنید.\n۳. در غیر این صورت، علامت + را زده و نوع را روی Clipboard بگذارید.\n۴. سوئیچ اتصال اصلی بالای برنامه را روشن کنید. 🍏`, {
            reply_markup: { inline_keyboard: [[{ text: "🔙 بازگشت به منو", callback_data: "guide_ios" }]] }
          });
          return new Response("OK");
        }

        if (data === "check_join") {
          const isMember = await checkChannelMembership(fromId);
          if (isMember) {
            await answerCallbackQuery(callbackId, "دمت گرم، عضویت تایید شد! 🔥");
            await sendMessage(
              fromId,
              "تبریک رفیق! منوی خرید با موفقیت برات باز شد: 🎉",
              { reply_markup: mainKeyboard }
            );
          } else {
            await answerCallbackQuery(callbackId, "❌ هنوز عضو کانال نشدی داداش کلک نزن!", true);
          }
          return new Response("OK");
        }

        if (fromId !== ADMIN_ID) {
          await answerCallbackQuery(callbackId, "فقط ادمین اجازه دارد.");
          return new Response("OK");
        }

        if (data.startsWith("approve:")) {
          const [, targetChatId, username] = data.split(":");
          await answerCallbackQuery(callbackId, "تایید شد");
          await sendMessage(
            targetChatId,
            "⏳ رسید شما تایید شد داداش!\n\n**سرویس شما ساخته خواهد شد، لطفاً کمی صبر کنید...** 🛠️\nهمین‌جا برات فرستاده میشه."
          );
          await sendMessage(
            ADMIN_ID,
            `تایید انجام شد برای \`${targetChatId}\`\n\nنام کاربری/سرویس پیشنهادی: \`${username}\`\n\nدستور ارسال دستی:\n\`ارسال:${targetChatId}:کانفیگ\``
          );
          return new Response("OK");
        }

        if (data.startsWith("reject:")) {
          const [, targetChatId] = data.split(":");
          await answerCallbackQuery(callbackId, "رد شد");
          await sendMessage(
            targetChatId,
            "❌ داداش رسید واریزی شما توسط مدیریت تایید نشد. اگر اشتباهی شده لطفا به پشتیبانی پیام بده یا دوباره رسید درست رو بفرست."
          );
          await sendMessage(ADMIN_ID, `رد انجام شد برای \`${targetChatId}\``);
          return new Response("OK");
        }

        return new Response("OK");
      }

      return new Response("OK");
    } catch (e) {
      return new Response("OK");
    }
  },
};
