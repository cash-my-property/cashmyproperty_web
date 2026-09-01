export const content = {
  auth: {
    hero: {
      tagline: "Offer Platform",
      title: "The Art of\nOwnership.",
      description: "Redefining real estate in the UAE through transparent digital offers.",
    },
    login: {
      heading: "Welcome back",
      subheading: "Enter your details to access your account.",
      emailLabel: "Email Address",
      emailPlaceholder: "Enter your email address",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      forgotPasswordText: "Forgot password?",
      submitButton: "Log in",
      dividerText: "or",
      uaePassButton: "Log in with UAE PASS",
      signupPrompt: "Don't have an account?",
      signupLinkText: "Sign up"
    },
    forgotPassword: {
      heading: "Reset password",
      subheading: "Enter your email address and we'll send you a 4-digit OTP to reset your password.",
      emailLabel: "Email Address",
      emailPlaceholder: "Enter your email address",
      otpLabel: "4-Digit OTP",
      otpPlaceholder: "1 2 3 4",
      submitButton: "Send OTP",
      verifyButton: "Verify OTP & Reset",
      backToLoginText: "Back to login",
      resendOtpText: "Didn't receive code? Resend"
    },
    signup: {
      heading: "Create your account",
      subheading: "Enter your professional details to get started.",
      firstNameLabel: "First Name",
      firstNamePlaceholder: "John",
      lastNameLabel: "Last Name",
      lastNamePlaceholder: "Doe",
      brnLabel: "BRN NO",
      brnPlaceholder: "Broker Reg. Number",
      referralLabel: "Referral Code",
      referralOptional: "(Optional)",
      referralPlaceholder: "Enter code",
      emailLabel: "Email Address",
      emailPlaceholder: "john.doe@example.com",
      phoneLabel: "Phone Number",
      phonePlaceholder: "50 123 4567",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      confirmPasswordLabel: "Confirm Password",
      confirmPasswordPlaceholder: "••••••••",
      termsAgreeStart: "I agree to the",
      termsOfService: "Terms of Service",
      and: "and",
      privacyPolicy: "Privacy Policy",
      submitButton: "Create Account",
      dividerText: "or",
      uaePassButton: "Sign up with UAE PASS",
      loginPrompt: "Already have an account?",
      loginLinkText: "Login"
    },
    logout: {
      heading: "You've been successfully\nsigned out",
      description: "Thank you for using our platform. Your session data is completely secure and all sensitive information has been cleared.",
      reloginButton: "Sign Back In",
      homeButton: "Go to Home Page",
      securityNote: "All tokens and cookies have been invalidated"
    }
  },
  about: {
    hero: {
      tagline: "Our Story",
      title: "Vision &\nExcellence.",
      description: "Transforming the property landscape in Dubai and across the Emirates."
    },
    main: {
      label: "About Cash My Property",
      heading: "The premier digital real estate offer platform in the UAE",
      paragraphs: [
        "Founded on the principles of transparency, efficiency, and innovation, Cash My Property is redefining how real estate is bought and sold in the UAE.",
        "We provide a secure, encrypted platform that connects verified sellers with qualified buyers. Our digital offers eliminate the noise of traditional listings, ensuring that every property transacted on our platform is genuine and tied to a real BRN, checked against official regulations."
      ],
      features: [
        {
          title: "Transparency",
          description: "Clear offer processes with no hidden fees or scraped ads."
        },
        {
          title: "Security",
          description: "Fully encrypted transactions and verified participants."
        }
      ],
      joinButton: "Join the Platform",
      contactButton: "Contact Us"
    }
  },
  blog: {
    hero: {
      tagline: "Insights & News",
      title: "Real Estate\nTrends.",
      description: "Stay up-to-date with the latest market analysis, platform updates, and real estate news in the UAE."
    },
    main: {
      label: "Our Blog",
      heading: "Latest Articles",
      readMore: "Read Full Article",
      posts: [
        {
          id: 1,
          title: "The Future of Digital Real Estate Offers in Dubai",
          date: "August 4, 2026",
          category: "Market Trends",
          excerpt: "How technology is reshaping the property market and making transactions more transparent than ever before."
        },
        {
          id: 2,
          title: "Understanding BRN Verification on Cash My Property",
          date: "July 28, 2026",
          category: "Platform Updates",
          excerpt: "A deep dive into our verification process and how it ensures maximum security for all participants."
        },
        {
          id: 3,
          title: "Top 5 Neighborhoods for Investment in 2026",
          date: "July 15, 2026",
          category: "Investment Guide",
          excerpt: "Our analysis of the most promising areas for real estate investment across the Emirates this year."
        }
      ]
    }
  },
  contact: {
    hero: {
      tagline: "Get In Touch",
      title: "Contact\nUs.",
      description: "Have questions about our platform? Our team of real estate experts is here to help you."
    },
    main: {
      label: "Contact Information",
      heading: "We'd love to hear from you",
      description: "Whether you are looking to buy, sell, or simply want to learn more about our secure digital offer platform, feel free to drop us a message.",
      form: {
        firstNameLabel: "First Name",
        firstNamePlaceholder: "John",
        lastNameLabel: "Last Name",
        lastNamePlaceholder: "Doe",
        emailLabel: "Email Address",
        emailPlaceholder: "john@example.com",
        phoneLabel: "Phone Number",
        phonePlaceholder: "+971 50 000 0000",
        messageLabel: "Message",
        messagePlaceholder: "How can we help you?",
        submitButton: "Send Message"
      },
      office: {
        title: "Our Office",
        addressTitle: "Headquarters",
        workingHoursTitle: "Working Hours",
        workingHours: "Mon - Fri: 9:00 AM - 6:00 PM\nSat - Sun: Closed"
      }
    }
  },
  home: {
    hero: {
      headline: "The Premier Digital Real Estate Offer Platform in the UAE",
      subheadline: "Buy, sell, and make offers on verified properties with 100% transparency. Our platform connects serious buyers with highly motivated sellers in a secure environment.",
      searchPlaceholder: "Search by location, property type, or keywords...",
      searchButton: "Search Properties",
      filters: {
        type: "Property Type",
        price: "Price Range",
        sort: "Sort By",
        types: {
          all: "All Types",
          residential: "Residential",
          commercial: "Commercial",
          land: "Land"
        },
        prices: {
          all: "Any Price",
          under1m: "Under 1M AED",
          "1mTo5m": "1M - 5M AED",
          over5m: "5M+ AED"
        },
        sortOptions: {
          newest: "Newest First",
          priceAsc: "Price: Low to High",
          priceDesc: "Price: High to Low"
        }
      }
    },
    realtimeOffers: {
      label: "Live Offers",
      heading: "Realtime Offers",
      description: "Properties currently in an active 7-Day Live Offer. Make an offer now before the timer runs out.",
      viewAllText: "View All Offers",
      items: [
        {
          id: "r1",
          title: "Luxury Marina Penthouse",
          location: "Dubai Marina, Dubai",
          currentBid: "AED 4,500,000",
          image: "/property-placeholder.svg",
          timeLeft: "2d 04h 15m",
          beds: 4,
          baths: 5,
          area: "3,200 sqft"
        },
        {
          id: "r2",
          title: "Modern Downtown Apartment",
          location: "Downtown Dubai",
          currentBid: "AED 2,100,000",
          image: "/property-placeholder.svg",
          timeLeft: "0d 12h 30m",
          beds: 2,
          baths: 2,
          area: "1,150 sqft"
        },
        {
          id: "r3",
          title: "Palm Jumeirah Signature Villa",
          location: "Palm Jumeirah, Dubai",
          currentBid: "AED 18,500,000",
          image: "/property-placeholder.svg",
          timeLeft: "5d 08h 45m",
          beds: 6,
          baths: 7,
          area: "7,500 sqft"
        }
      ]
    },
    simpleListings: {
      label: "Standard Properties",
      heading: "Simple Listings",
      description: "Verified properties available for immediate purchase at a fixed asking price.",
      viewAllText: "View All Listings",
      items: [
        {
          id: "s1",
          title: "JLT Lake View Office Space",
          location: "Jumeirah Lake Towers",
          price: "AED 1,800,000",
          image: "/property-placeholder.svg",
          type: "Commercial",
          area: "2,000 sqft"
        },
        {
          id: "s2",
          title: "Arabian Ranches Townhouse",
          location: "Arabian Ranches",
          price: "AED 3,250,000",
          image: "/property-placeholder.svg",
          beds: 3,
          baths: 4,
          area: "2,400 sqft"
        },
        {
          id: "s3",
          title: "Dubai Hills Estate Mansion",
          location: "Dubai Hills Estate",
          price: "AED 12,000,000",
          image: "/property-placeholder.svg",
          beds: 5,
          baths: 6,
          area: "6,000 sqft"
        }
      ]
    },
    howItWorks: {
      label: "The CMP Workflow",
      heading: "How It Works",
      steps: [
        {
          title: "Register & Verify",
          description: "Enter your Broker Registration Number (BRN). The system verifies it instantly, auto-filling your details. Admin approves your account to begin."
        },
        {
          title: "Upload & Browse",
          description: "Buyers must upload mandatory documents (Contract B, Emirates ID, 10% Cheque) to unlock the 'Place Offer' capability on live properties."
        },
        {
          title: "Offer, Win & Close",
          description: "Place your offers on Realtime Offers (7-Day Offers) or purchase Simple Listings. Highest offer wins at the end of the countdown timer!"
        }
      ]
    },
    whyChooseUs: {
      label: "Our Core Values",
      heading: "Why Choose CMP",
      features: [
        {
          title: "Transparency First",
          description: "No hidden fees, no opaque processes. All offers are tracked and visible, ensuring a fair market value for every transaction."
        },
        {
          title: "Secure Verification",
          description: "Fully compliant with the Dubai Land Department regulations. We enforce mandatory document checks before any offer is placed."
        },
        {
          title: "Immediate Liquidity",
          description: "Our 7-Day Offer model provides immediate liquidity for motivated sellers, while buyers get fair access to property listings."
        }
      ]
    },
    appDownload: {
      tagline: "Get the CMP App",
      heading: "Your Real Estate Portfolio, Now in Your Pocket",
      description: "Experience the fastest way to make offers, buy, and sell properties in the UAE. Download the Cash My Property app for real-time offer alerts, document management, and seamless transactions.",
      appStoreText: "Download on the",
      appStore: "App Store",
      playStoreText: "GET IT ON",
      playStore: "Google Play"
    },
    cta: {
      heading: "Ready to find your next property?",
      description: "Join the premier digital real estate offer platform in the UAE. Verified listings, transparent processes, and secure transactions.",
      buttonText: "Create an Account"
    }
  },
  listings: {
    hero: {
      tagline: "Property Listings",
      title: "Discover Your\nNext Property",
      description: "Explore our exclusive verified properties available for immediate purchase or active live offers."
    },
    filters: {
      searchPlaceholder: "Search properties by name or location...",
      priceLabel: "Price Range",
      typeLabel: "Property Type",
      bedsLabel: "Bedrooms",
      searchButton: "Search"
    },
    cards: {
      baths: "Baths",
      beds: "Beds",
      sqft: "Sqft",
      viewDetails: "View Details",
      startingOffer: "Starting Offer"
    },
    detail: {
      additionalDetails: "Additional Details",
      description: "Description",
      features: "Features",
      category: "Category",
      plan: "Property Plan",
      trakheesi: "Trakheesi Number",
      interestedTitle: "Interested in this property?",
      interestedDesc: "Log in to make an offer or place a bid on this property.",
      makeOffer: "Make Offer",
      loginRequired: "Login Required",
      loginRequiredDesc: "You need to be logged in to make an offer. Would you like to log in now?",
      stayLoggedOut: "Stay Logged Out",
      goToLogin: "Go to Login",
      verifiedDld: "Verified Property",
      backToProperties: "Back to listings",
      propertyNotFound: "Property not found"
    }
  },
  dashboard: {
    sidebar: {
      overview: "Overview",
      myOffers: "My Offers",
      favorites: "Favorites",
      settings: "Settings",
      logout: "Log Out"
    }
  }
};
