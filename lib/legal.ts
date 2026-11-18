import type { Locale } from "./i18n";

// The text of the Privacy Policy and the Terms of Use. To change a sentence, edit it here.
export type LegalDoc = {
  metaTitle: string;
  kicker: string;
  title: string;
  updated: string;
  sections: { heading: string; paragraphs: string[] }[];
};

const EMAIL = "valjevac.sadzida002@gmail.com";

const privacy: Record<Locale, LegalDoc> = {
  en: {
    metaTitle: "Privacy Policy",
    kicker: "Your data",
    title: "Privacy Policy",
    updated: "Last updated: 18 November 2026",
    sections: [
      {
        heading: "Who I am",
        paragraphs: [
          `Sweet & Salty Diaries is a personal food blog run by Sadžida Valjevac from Bosnia and Herzegovina. If you have any question about your data, write to ${EMAIL}.`,
        ],
      },
      {
        heading: "What I collect",
        paragraphs: [
          "You can read the whole site without an account, and then I collect nothing about you except anonymous visit counts (see “Cookies and visit statistics” below).",
          "If you create an account, I store: your email address, the name and profile picture that Google (or your email sign-up) gives me, and what you do on the site: the recipes you like, the comments you write and the photos of your own recreations that you upload, together with the date.",
          "I never see your Google password. I do not collect payment details, and I do not sell or share your data for advertising.",
        ],
      },
      {
        heading: "Why I collect it",
        paragraphs: [
          "Only to run the site: to let you log in, to show your profile, likes, comments and photos, and to let me remove anything that breaks the rules.",
        ],
      },
      {
        heading: "Who handles the data",
        paragraphs: [
          "Supabase stores accounts, comments, likes and uploaded photos on my behalf. Google handles the “Continue with Google” sign-in. Vercel hosts the website. These services process data only to provide their service.",
          "Your comments and uploaded photos are public: anyone who visits the recipe page can see them together with your display name and profile picture.",
        ],
      },
      {
        heading: "Cookies and visit statistics",
        paragraphs: [
          "When you are logged in the site uses an essential cookie that keeps you signed in, and a cookie that remembers your language. Both are needed for the site to work. The sound setting is saved in your browser's own storage.",
          "I use Vercel Web Analytics to count visits. It does not use cookies and does not track you across other websites.",
        ],
      },
      {
        heading: "How long I keep it",
        paragraphs: [
          "As long as your account exists. When you delete your account, your profile, likes, comments and photos are deleted as well.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          `You can ask me to show you, correct or delete your data at any time, and you can delete your own comments and photos yourself. Write to ${EMAIL} and I will answer as soon as I can.`,
        ],
      },
      {
        heading: "Changes",
        paragraphs: ["If I change this policy, the new version appears on this page with a new date."],
      },
    ],
  },
  bs: {
    metaTitle: "Politika privatnosti",
    kicker: "Vaši podaci",
    title: "Politika privatnosti",
    updated: "Posljednje ažuriranje: 18. novembar 2026.",
    sections: [
      {
        heading: "Ko sam ja",
        paragraphs: [
          `Sweet & Salty Diaries je lični kulinarski blog koji vodi Sadžida Valjevac iz Bosne i Hercegovine. Ako imate bilo kakvo pitanje o vašim podacima, pišite na ${EMAIL}.`,
        ],
      },
      {
        heading: "Šta prikupljam",
        paragraphs: [
          "Cijeli sajt možete čitati bez računa i tada ne prikupljam ništa o vama osim anonimnog brojanja posjeta (pogledajte „Kolačići i statistika posjeta” ispod).",
          "Ako napravite račun, pohranjujem: vašu email adresu, ime i profilnu sliku koje mi daje Google (ili vaša registracija putem emaila) te ono što radite na sajtu: recepte koje lajkujete, komentare koje napišete i fotografije vlastitih verzija recepata koje otpremite, zajedno s datumom.",
          "Nikada ne vidim vašu Google lozinku. Ne prikupljam podatke o plaćanju i ne prodajem niti dijelim vaše podatke u reklamne svrhe.",
        ],
      },
      {
        heading: "Zašto ih prikupljam",
        paragraphs: [
          "Samo da bi sajt radio: da vam omogućim prijavu, prikaz profila, lajkova, komentara i fotografija te da mogu ukloniti sve što krši pravila.",
        ],
      },
      {
        heading: "Ko obrađuje podatke",
        paragraphs: [
          "Supabase u moje ime pohranjuje račune, komentare, lajkove i otpremljene fotografije. Google obrađuje prijavu putem „Nastavi s Googleom”. Vercel hostuje web stranicu. Ove usluge obrađuju podatke samo da bi pružile svoju uslugu.",
          "Vaši komentari i otpremljene fotografije su javni: svako ko posjeti stranicu recepta može ih vidjeti zajedno s vašim prikazanim imenom i profilnom slikom.",
        ],
      },
      {
        heading: "Kolačići i statistika posjeta",
        paragraphs: [
          "Kada ste prijavljeni, sajt koristi neophodan kolačić koji vas drži prijavljenim i kolačić koji pamti vaš jezik. Oba su potrebna da bi sajt radio. Postavka zvuka se čuva u pohrani vašeg preglednika.",
          "Za brojanje posjeta koristim Vercel Web Analytics. Ne koristi kolačiće i ne prati vas na drugim web stranicama.",
        ],
      },
      {
        heading: "Koliko dugo ih čuvam",
        paragraphs: [
          "Dok god vaš račun postoji. Kada obrišete račun, brišu se i vaš profil, lajkovi, komentari i fotografije.",
        ],
      },
      {
        heading: "Vaša prava",
        paragraphs: [
          `U bilo kojem trenutku možete zatražiti uvid u svoje podatke, ispravku ili brisanje, a vlastite komentare i fotografije možete i sami obrisati. Pišite na ${EMAIL} i odgovorit ću što prije.`,
        ],
      },
      {
        heading: "Izmjene",
        paragraphs: ["Ako promijenim ovu politiku, nova verzija će se pojaviti na ovoj stranici s novim datumom."],
      },
    ],
  },
};

const terms: Record<Locale, LegalDoc> = {
  en: {
    metaTitle: "Terms of Use",
    kicker: "House rules",
    title: "Terms of Use",
    updated: "Last updated: 18 November 2026",
    sections: [
      {
        heading: "Welcome",
        paragraphs: [
          "Sweet & Salty Diaries is a personal food blog. By using the site or creating an account you agree to these simple rules.",
        ],
      },
      {
        heading: "The recipes and photos",
        paragraphs: [
          "The recipes, texts and photos on this site are mine unless stated otherwise. You are welcome to cook them, share the link and post about your results. Please do not copy the site's content to publish it as your own.",
          "I cook for fun and I am not a professional. Check ingredients against your own allergies and diet, and use your own judgement in the kitchen.",
        ],
      },
      {
        heading: "Your account",
        paragraphs: [
          "You can create an account with Google or email. Keep your login to yourself and tell me if you think someone else is using it. You can delete your account at any time.",
        ],
      },
      {
        heading: "Comments and photos",
        paragraphs: [
          "You may comment on recipes and upload a photo of your own version of a recipe. You keep ownership of what you post, and you allow me to show it on this site.",
          "Please be kind. Do not post anything that is hateful, harassing, misleading, illegal or spam, and upload only photos that you took yourself and that do not show other people without their permission.",
          "I may remove comments or photos that break these rules, and close accounts that keep breaking them.",
        ],
      },
      {
        heading: "The site as it is",
        paragraphs: [
          "I do my best to keep the site running and correct, but I cannot promise it will always be available or free of mistakes, and I am not responsible for any loss that comes from using it.",
        ],
      },
      {
        heading: "Changes and contact",
        paragraphs: [
          `I may update these terms, and the new date will appear on this page. Questions are welcome at ${EMAIL}.`,
        ],
      },
    ],
  },
  bs: {
    metaTitle: "Uslovi korištenja",
    kicker: "Kućna pravila",
    title: "Uslovi korištenja",
    updated: "Posljednje ažuriranje: 18. novembar 2026.",
    sections: [
      {
        heading: "Dobrodošli",
        paragraphs: [
          "Sweet & Salty Diaries je lični kulinarski blog. Korištenjem sajta ili pravljenjem računa prihvatate ova jednostavna pravila.",
        ],
      },
      {
        heading: "Recepti i fotografije",
        paragraphs: [
          "Recepti, tekstovi i fotografije na ovom sajtu su moji, osim ako nije drugačije navedeno. Slobodno ih kuhajte, dijelite link i objavljujte svoje rezultate. Molim vas da sadržaj sajta ne kopirate i ne objavljujete kao svoj.",
          "Kuham iz zadovoljstva i nisam profesionalac. Provjerite sastojke prema vlastitim alergijama i ishrani te koristite vlastitu procjenu u kuhinji.",
        ],
      },
      {
        heading: "Vaš račun",
        paragraphs: [
          "Račun možete napraviti putem Googlea ili emaila. Svoju prijavu čuvajte za sebe i javite mi ako mislite da je neko drugi koristi. Račun možete obrisati u bilo kojem trenutku.",
        ],
      },
      {
        heading: "Komentari i fotografije",
        paragraphs: [
          "Možete komentarisati recepte i otpremiti fotografiju vlastite verzije recepta. Vlasništvo nad onim što objavite ostaje vaše, a meni dozvoljavate da to prikažem na ovom sajtu.",
          "Budite ljubazni. Ne objavljujte ništa što je puno mržnje, uznemirava, obmanjuje, nezakonito je ili je spam, i otpremajte samo fotografije koje ste sami snimili i na kojima nema drugih osoba bez njihove dozvole.",
          "Mogu ukloniti komentare ili fotografije koji krše ova pravila i zatvoriti račune koji ih stalno krše.",
        ],
      },
      {
        heading: "Sajt takav kakav jest",
        paragraphs: [
          "Trudim se da sajt radi i da bude tačan, ali ne mogu obećati da će uvijek biti dostupan ili bez grešaka i nisam odgovorna za bilo kakvu štetu nastalu njegovim korištenjem.",
        ],
      },
      {
        heading: "Izmjene i kontakt",
        paragraphs: [
          `Mogu izmijeniti ove uslove, a novi datum će se pojaviti na ovoj stranici. Pitanja su dobrodošla na ${EMAIL}.`,
        ],
      },
    ],
  },
};

export function getPrivacy(lang: Locale): LegalDoc {
  return privacy[lang];
}

export function getTerms(lang: Locale): LegalDoc {
  return terms[lang];
}
