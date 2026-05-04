/**
 * Static marketing copy — swap for CMS/API later without touching layout components.
 */

export const hero = {
  badge: 'AI-powered expense tracking',
  titleLead: 'Smart expense tracking,',
  titleAccent: 'powered by AI',
  subtitle:
    'Upload receipts, review AI-extracted fields, and keep every expense organized in one place — with confidence scores and export when you need it.',
}

export const features = [
  {
    id: 'scan',
    title: 'Smart receipt scanning',
    description:
      'Snap a photo or upload an image. OCR and structured extraction help you capture vendor, totals, and line items faster.',
    icon: 'scan',
  },
  {
    id: 'categorize',
    title: 'Structured records',
    description:
      'Every expense is stored with clear fields and flags so you can filter, review, and approve without digging through PDFs.',
    icon: 'layers',
  },
  {
    id: 'insights',
    title: 'Insights at a glance',
    description:
      'Dashboard summaries and currency breakdowns give you a quick read on spending without a separate spreadsheet.',
    icon: 'chart',
  },
  {
    id: 'private',
    title: 'Your data, your account',
    description:
      'Sign-in protects your expenses. Built for individuals and small teams who want control without complexity.',
    icon: 'lock',
  },
]

export const howItWorks = [
  {
    step: '1',
    title: 'Upload',
    text: 'Add a receipt image from your device.',
  },
  {
    step: '2',
    title: 'Review',
    text: 'Check AI-extracted fields and confirm or edit.',
  },
  {
    step: '3',
    title: 'Save',
    text: 'Store the expense and use filters & export anytime.',
  },
]

export const pricingTeaser = [
  // title: 'Straightforward to start',
  // body: 'Create a free account to try the full flow. No credit card required for the MVP — you bring your own API keys where needed.',

    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started with basic organization.',
      features: [
        '5 receipt scans per month',
        'Basic data extraction',
        'Standard dashboard access',
        'Community support'
      ],
      buttonText: 'Start for free',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$12',
      description: 'Advanced AI features for power users.',
      features: [
        'Unlimited receipt scans',
        'City & Country detection',
        'RAG-powered expense chat',
        'Priority export & support'
      ],
      buttonText: 'Upgrade to Pro',
      popular: true, // Highlight this plan
    }
  ];


export const aboutBlurb =
  'Paper Brain is focused on receipt-to-expense workflows: fast capture, human-in-the-loop review, and a simple dashboard. We prioritize clarity over feature sprawl.'
