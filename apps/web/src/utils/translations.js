// Central translations — English & Amharic
// All user-facing strings live here

const t = {
  en: {
    // Navbar
    nav: {
      work: 'Work',
      about: 'About',
      testimonials: 'Testimonials',
      blog: 'Blog',
      faq: 'FAQ',
      contact: 'Contact',
      discipline: 'Architecture · Interior · Finishing',
    },

    // Hero
    hero: {
      label: "Addis Ababa's Architecture & Interior Studio",
      headline1: 'Spaces that',
      headline2: 'inspire',
      headline3: 'living.',
      proof: '100+ spaces completed across Ethiopia',
      viewWork: 'Request a Quote',
      whatsapp: 'WhatsApp Us',
    },

    // Portfolio
    portfolio: {
      heading: 'Work',
      open: 'Open →',
      views: (n) => `${n} views`,
      projects: (n) => `${n} Projects`,
      type: 'Type',
      year: 'Year',
      category: 'Category',
      whatsappModal: 'WhatsApp about this',
      enquiry: 'Send enquiry',
    },

    // About
    about: {
      headline1: 'We design spaces',
      headline2: 'that outlast trends.',
      tagline: 'At Awra Designs, we create architecture that balances elegance, functionality, and lasting value. Every project is thoughtfully crafted to reflect its purpose, its environment, and the people who experience it.',
      teamHeading: 'The People',
      names: {
        'Tesfahun Tsegaye': 'Tesfahun Tsegaye',
        'Sarah Bekele':     'Sarah Bekele',
        'Daniel Haile':     'Daniel Haile',
        'Bereket Fikre':    'Bereket Fikre',
      },
      roles: {
        'Tesfahun Tsegaye': 'Founder & Lead Architect',
        'Sarah Bekele': 'Lead Interior Designer',
        'Daniel Haile': 'Senior Architect',
        'Bereket Fikre': 'Brand Designer',
      },
    },

    // Contact
    contact: {
      touch: 'Get in Touch',
      heading1: 'Start a',
      heading2: 'conversation.',
      proof: 'Trusted by 100+ clients across Ethiopia',
      waBtn: 'Chat on WhatsApp',
      namePh: 'Name',
      emailPh: 'Email',
      msgPh: 'Tell us about your project',
      send: 'Send Message',
      sendShort: 'Send',
      sending: 'Sending…',
      sent: "Message sent — we'll be in touch soon.",
      sentShort: 'Sent.',
      err: 'Something went wrong. Please try again.',
      errShort: 'Failed — try again.',
      labels: {
        WhatsApp: 'WhatsApp / Phone',
        Email: 'Email',
        Location: 'Location',
      },
    },

    // Footer
    footer: {
      est: 'Est. 2019 · Addis Ababa',
      estDesktop: 'Est. 2019',
      location: 'Addis Ababa, Ethiopia',
      copy: (y) => `© ${y} Awra Finishing & Interior`,
    },

    // Floating CTA
    floating: {
      whatsapp: 'WhatsApp Us',
      call: 'Call',
    },

    // Blog
    blog: {
      heading: 'Insights',
      readMore: 'Read →',
      close: 'Close',
      share: 'Share',
      copyLink: 'Copy link',
      copied: 'Copied',
      whatsapp: 'WhatsApp',
      esc: 'ESC to close',
    },

    // Permit Calculator
    permit: {
      heading: 'Building Permit',
      subheading: 'Fee Calculator',
      description: 'Estimate your Addis Ababa building permit review fee in seconds.',
      buildingType: 'Building Type',
      floorCount: 'Number of Floors',
      basement: 'Basement Levels',
      serviceCategory2: 'Additional Service (Category 2)',
      serviceCategory3: 'Additional Service (Category 3)',
      calculate: 'Calculate Fee',
      reset: 'Reset',
      print: 'Print Summary',
      requestConsultation: 'Request Consultation With This Estimate',
      enterDetails: 'Enter details to calculate',
      breakdown: 'Estimated Fee Breakdown',
      total: 'Total Estimated Cost',
      referenceCode: 'Reference Code',
      referenceYear: '2017 E.C.',
      source: 'Addis Ababa Building Permit Fee Schedule',
      disclaimer: 'This estimate is based on the Addis Ababa Building Permit Fee Schedule (2017 E.C.) and is provided for guidance only. It is not an official government payment receipt. Subsequent amendments must be verified before treating these rates as current.',
      amendmentNotice: 'Fees and regulations are subject to change. Always verify with the Addis Ababa City Administration before making any payments.',
      effectiveDate: 'Effective Date',
      lastUpdated: 'Last Updated',
      processingTime: 'Est. Processing Time',
      needCompleteDesign: 'Need a complete design and permit package? AWRA Designs can handle the entire process from concept to approval.',
      residential: 'Residential',
      commercial: 'Commercial',
      mixed: 'Mixed Use',
      none: 'None',
      oneBasement: 'One Basement',
      twoBasements: 'Two Basements',
      threeBasements: 'Three Basements',
      floors: (n) => `${n} floor${n !== 1 ? 's' : ''}`,
    },
  },

  am: {
    // Navbar
    nav: {
      work: 'ስራዎቻችን',
      about: 'ስለ እኛ',
      testimonials: 'ደንበኞች',
      blog: 'ጦማር',
      faq: 'ጥያቄዎች',
      contact: 'ያግኙን',
      discipline: 'አርክቴክቸር · ኢንቴሪየር · ፊኒሺንግ',
    },

    // Hero
    hero: {
      label: 'የአዲስ አበባ አርክቴክቸርና ኢንቴሪየር ስቱዲዮ',
      headline1: 'እርስዎን ማዕከል ያደረገ',
      headline2: 'ዲዛይን።',
      headline3: '',
      proof: '100+ ፕሮጀክቶች በኢትዮጵያ ተጠናቅቀዋል',
      viewWork: 'ጥያቄ ላኩ',
      whatsapp: 'በ WhatsApp ያናግሩን',
    },

    // Portfolio
    portfolio: {
      heading: 'ስራዎች',
      open: 'ክፈት →',
      views: (n) => `${n} እይታዎች`,
      projects: (n) => `${n} ፕሮጀክቶች`,
      type: 'አይነት',
      year: 'ዓመት',
      category: 'ምድብ',
      whatsappModal: 'ስለዚህ ፕሮጀክት WhatsApp ያድርጉ',
      enquiry: 'ጥያቄ ላኩ',
    },

    // About
    about: {
      headline1: 'ዘመን የማይሽሯቸው',
      headline2: 'ቦታዎችን እንነድፋለን።',
      tagline: 'ልዩ አርክቴክቸር በግልጽነት ይጀምራል ብለን እናምናለን። በጥሩ ዲዛይን እና ጥልቅ ትኩረት፣ ዘመን ተሻጋሪ፣ ተግባራዊ እና አነቃቂ ቦታዎችን እንቀርጻለን።',
      teamHeading: 'ቡድናችን',
      names: {
        'Tesfahun Tsegaye': 'ተስፋሁን ፀጋዬ',
        'Sarah Bekele':     'ሣራ በቀለ',
        'Daniel Haile':     'ዳንኤል ሃይሌ',
        'Bereket Fikre':    'በረከት ፍቅሬ',
      },
      roles: {
        'Tesfahun Tsegaye': 'መስራች እና ዋና አርክቴክት',
        'Sarah Bekele': 'ዋና ኢንቴሪየር ዲዛይነር',
        'Daniel Haile': 'ሲኒየር አርክቴክት',
        'Bereket Fikre': 'ብራንድ ዲዛይነር',
      },
    },

    // Contact
    contact: {
      touch: 'ያግኙን',
      heading1: 'ስለ ፕሮጀክትዎ',
      heading2: 'ያናግሩን።',
      proof: '100+ ደንበኞች ኢትዮጵያ ውስጥ ያምኑናል',
      waBtn: 'በ WhatsApp ያናግሩን',
      namePh: 'ስም',
      emailPh: 'ኢሜይል',
      msgPh: 'ስለ ፕሮጀክትዎ ያስረዱን',
      send: 'መልእክት ላክ',
      sendShort: 'ላክ',
      sending: 'እየተላከ…',
      sent: 'መልእክትዎ ተልኳል — በቅርቡ እናገኝዎታለን።',
      sentShort: 'ተልኳል።',
      err: 'ስህተት ተከስቷል። እንደገና ይሞክሩ።',
      errShort: 'አልተሳካም — ይሞክሩ።',
      labels: {
        WhatsApp: 'WhatsApp / ስልክ',
        Email: 'ኢሜይል',
        Location: 'አድራሻ',
      },
    },

    // Footer
    footer: {
      est: 'ከ2019 ጀምሮ · አዲስ አበባ',
      estDesktop: 'ከ2019 ጀምሮ',
      location: 'አዲስ አበባ, ኢትዮጵያ',
      copy: (y) => `© ${y} አውራ ፊኒሺንግ እና ኢንቴሪየር`,
    },

    // Floating CTA
    floating: {
      whatsapp: 'በ WhatsApp ያናግሩን',
      call: 'ይደውሉ',
    },

    // Blog
    blog: {
      heading: 'ሃሳቦች',
      readMore: 'አንብብ →',
      close: 'ዝጋ',
      share: 'አጋራ',
      copyLink: 'ሊንክ ቅዳ',
      copied: 'ተቀዷል',
      whatsapp: 'WhatsApp',
      esc: 'ESC ለመዝጋት',
    },

    // Permit Calculator
    permit: {
      heading: 'ግንባት ፍቃድ',
      subheading: 'ክፍያ ማስላት',
      description: 'የአዲስ አበባ ግንባት ፍቃድ ክፍያ በአጭር ጊዜ ያስሉ።',
      buildingType: 'የግንባት አይነት',
      floorCount: 'የፎቅ ቁጥር',
      basement: 'የታችኛው ፎቅ ቁጥር',
      serviceCategory2: 'ተጨማሪ አገልግሎት (ምድብ 2)',
      serviceCategory3: 'ተጨማሪ አገልግሎት (ምድብ 3)',
      calculate: 'ክፍያ ማስላት',
      reset: 'እንደነበረ መልስ',
      print: 'ማተም',
      requestConsultation: 'በዚህ ግመት አማካኝነት ይጠይቁ',
      enterDetails: 'ለማስላት ዝርዝሮችን ያስገቡ',
      breakdown: 'የክፍያ ዝርዝር',
      total: 'ጠቅላላ ግመት',
      referenceCode: 'ማመልከቻ ኮድ',
      referenceYear: '2017 ዓ/ም',
      source: 'የአዲስ አበባ ግንባት ፍቃድ ክፍያ ሰንበር',
      disclaimer: 'ይህ ግመት በአዲስ አበባ ግንባት ፍቃድ ክፍያ ሰንበር (2017 ዓ/ም) የተመሠረተ ነው። ይህ ይፋዊ የመንግስት ክፍያ ሰረዳኢ አይደለም። ክፍዎች እና አዋጮች ሊለወጡ ይችላሉ።',
      amendmentNotice: 'ክፍዎች እና አዋጮች ሊለወጡ ይችላሉ። ክፍያ ከማድረግዎ በፊት በአዲስ አበባ ከተማ አስተዳደር ያረጋግጡ።',
      effectiveDate: 'የሚያፈርስበት ቀን',
      lastUpdated: 'መጨረሻ የተሻሻለው',
      processingTime: 'የማቀናበሪያ ጊዜ',
      needCompleteDesign: 'ሙሉ ዲዛይን እና ፍቃድ ፓኬጅ ያስፈልጋሉ? አውራ ዲዛይንስ ከስልት እስከ ፍቃድ ድረስ ሙሉ ሂደት ሊያካሂድ ይችላል።',
      residential: 'የኔብሻ',
      commercial: 'የንግድ',
      mixed: 'የተቀላቀለ',
      none: 'የለም',
      oneBasement: 'አንድ ታችኛው ፎቅ',
      twoBasements: 'ሁለት ታችኛው ፎቆች',
      threeBasements: 'ሶስት ታችኛው ፎቆች',
      floors: (n) => `${n} ፎቅ`,
    },
  },
}

export default t
