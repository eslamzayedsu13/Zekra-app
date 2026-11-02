// Long-form bilingual page copy. Contact details are placeholders until the owner supplies real ones.
type S = { title: string; body: string[] };
export const pages: Record<
  string,
  {
    ar: { title: string; intro: string; sections: S[] };
    en: { title: string; intro: string; sections: S[] };
  }
> = {
  about: {
    ar: {
      title: "نصنع ما يُحفظ.",
      intro:
        "ذِكرى متجر صغير في القاهرة لهدايا الخطوبة والتذكارات، بدأ من الرغبة في أن تبقى اللحظات الجميلة شيئًا يُلمس.",
      sections: [
        {
          title: "البداية",
          body: [
            "بدأت ذِكرى في ٢٠٢٤ على طاولة مطبخ، بين ورق التغليف وشرائط الحرير. أردنا هدايا لا تُنسى في درج، بل تُحفظ وتُروى.",
          ],
        },
        {
          title: "الحرفة",
          body: [
            "نعمل مع حرفيين في القاهرة والفيوم: خزّافين، ومجلّدي كتب، وصنّاع جلد. كل قطعة تُصنع بكميات قليلة وتُراجع يدويًا قبل أن تغادرنا.",
          ],
        },
        {
          title: "الوعد",
          body: ["تغليف يدوي، حفر بعناية، وتواصل حقيقي. إذا لم تصل الهدية كما تستحق، نصلحها."],
        },
      ],
    },
    en: {
      title: "We make things to be kept.",
      intro:
        "Zekra is a small Cairo studio for engagement gifts and keepsakes, born from wanting beautiful moments to become something you can hold.",
      sections: [
        {
          title: "Beginnings",
          body: [
            "Zekra began in 2024 on a kitchen table, between wrapping paper and silk ribbon. We wanted gifts that are kept and retold, not forgotten in a drawer.",
          ],
        },
        {
          title: "The craft",
          body: [
            "We work with artisans in Cairo and Faiyum — potters, bookbinders, leatherworkers. Every piece is made in small batches and checked by hand before it leaves us.",
          ],
        },
        {
          title: "Our promise",
          body: [
            "Wrapped by hand, engraved with care, and real people on the other end. If a gift doesn't arrive as it deserves, we make it right.",
          ],
        },
      ],
    },
  },
  faq: {
    ar: {
      title: "أسئلة شائعة",
      intro: "إجابات مختصرة عن الطلب والحفر والتوصيل.",
      sections: [
        {
          title: "كم يستغرق الحفر؟",
          body: ["تُضاف عادةً يوم إلى يومي عمل قبل الشحن للقطع المحفورة."],
        },
        {
          title: "كيف أدفع؟",
          body: [
            "حاليًا الدفع عند الاستلام فقط. الدفع بالبطاقة والمحافظ الإلكترونية وفوري قريبًا.",
          ],
        },
        {
          title: "هل يمكن إرسال الهدية لشخص آخر؟",
          body: [
            "نعم، اكتبوا عنوانه عند الطلب وأضيفوا بطاقة تهنئة برسالتكم. لا نضع الفاتورة داخل الصندوق.",
          ],
        },
        {
          title: "هل يمكن تعديل الطلب؟",
          body: [
            "تواصلوا معنا قبل الشحن وسنعدّله إن أمكن. القطع المحفورة لا تُعدّل بعد بدء الحفر.",
          ],
        },
      ],
    },
    en: {
      title: "Frequently asked",
      intro: "Short answers about ordering, engraving and delivery.",
      sections: [
        {
          title: "How long does engraving take?",
          body: ["Engraved pieces usually add one to two working days before dispatch."],
        },
        {
          title: "How can I pay?",
          body: [
            "For now, cash on delivery only. Cards, mobile wallets and Fawry are coming soon.",
          ],
        },
        {
          title: "Can I send a gift to someone else?",
          body: [
            "Yes — enter their address at checkout and add a greeting card with your message. We never put the invoice in the box.",
          ],
        },
        {
          title: "Can I change my order?",
          body: [
            "Contact us before dispatch and we'll change it if we can. Engraved pieces can't be changed once engraving has started.",
          ],
        },
      ],
    },
  },
  shipping: {
    ar: {
      title: "الشحن والتوصيل",
      intro: "نوصّل إلى كل محافظات مصر، والدفع عند الاستلام.",
      sections: [
        {
          title: "الرسوم",
          body: [
            "القاهرة والجيزة ٦٠ ج.م، الإسكندرية والقليوبية ٧٠ ج.م، الدلتا والقناة ٨٠ ج.م، الصعيد ٩٠–١٠٠ ج.م، والمحافظات الحدودية ١٢٠ ج.م.",
            "الشحن مجاني للطلبات من ٣٬٠٠٠ ج.م فأكثر.",
          ],
        },
        {
          title: "المدة",
          body: ["١–٢ يوم للقاهرة والجيزة، و٢–٧ أيام لباقي المحافظات حسب المسافة."],
        },
        { title: "التتبّع", body: ["يمكنكم متابعة حالة طلبكم من صفحة طلباتي في حسابكم."] },
      ],
    },
    en: {
      title: "Shipping & delivery",
      intro: "We deliver to every governorate in Egypt, with cash on delivery.",
      sections: [
        {
          title: "Fees",
          body: [
            "Cairo & Giza EGP 60, Alexandria & Qalyubia EGP 70, Delta & Canal EGP 80, Upper Egypt EGP 90–100, frontier governorates EGP 120.",
            "Free shipping on orders of EGP 3,000 or more.",
          ],
        },
        {
          title: "Timing",
          body: ["1–2 days for Cairo and Giza, 2–7 days elsewhere depending on distance."],
        },
        {
          title: "Tracking",
          body: ["Follow your order status from the Orders page in your account."],
        },
      ],
    },
  },
  returns: {
    ar: {
      title: "الاسترجاع والاستبدال",
      intro: "نريد أن تحبّوا ما تهدونه.",
      sections: [
        {
          title: "خلال ١٤ يومًا",
          body: [
            "يمكن استرجاع أو استبدال القطع غير المستخدمة في تغليفها الأصلي خلال ١٤ يومًا من الاستلام.",
          ],
        },
        {
          title: "القطع المخصّصة",
          body: [
            "القطع المحفورة أو المخصّصة لا تُسترجع إلا في حالة وجود عيب في الصنع أو خطأ منّا.",
          ],
        },
        {
          title: "الخطوات",
          body: [
            "تواصلوا معنا برقم الطلب، وسنرتّب استلام القطعة. يُرد المبلغ نقدًا أو كرصيد خلال ٧ أيام من استلامها.",
          ],
        },
      ],
    },
    en: {
      title: "Returns & exchanges",
      intro: "We want you to love what you give.",
      sections: [
        {
          title: "Within 14 days",
          body: [
            "Unused pieces in their original packaging can be returned or exchanged within 14 days of delivery.",
          ],
        },
        {
          title: "Personalised pieces",
          body: [
            "Engraved or personalised pieces can only be returned for a manufacturing defect or our mistake.",
          ],
        },
        {
          title: "How it works",
          body: [
            "Contact us with your order number and we'll arrange a pickup. Refunds are made in cash or store credit within 7 days of receiving the item.",
          ],
        },
      ],
    },
  },
};
