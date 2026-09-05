"use client";

import React, { useState, useEffect } from "react";

const EDUCATIONAL_CARDS = [
  {
    stage: "EXTRACTING",
    cards: [
      {
        icon: "📋",
        title: "Reading your bill",
        content: "We are scanning every line of your bill. Hospital bills can have 20–100 line items. We check every single one.",
      },
      {
        icon: "🔍",
        title: "Did you know?",
        content: "Most patients never question their hospital bill. Those who do recover an average of 15–30% of the total amount.",
      },
    ],
  },
  {
    stage: "AUDITING",
    cards: [
      {
        icon: "⚖️",
        title: "Checking government rules",
        content: "We are comparing every charge against the CGHS Rate Schedule, NPPA price caps, and DPCO drug ceilings right now.",
      },
      {
        icon: "💊",
        title: "Did you know?",
        content: "The government has fixed ceiling prices on over 800 essential medicines under the Drug Prices Control Order. Hospitals frequently charge above these limits.",
      },
      {
        icon: "🏥",
        title: "Stent price caps",
        content: "The government capped cardiac stent prices at ₹27,890 in 2017. Before the cap, hospitals charged up to ₹1.5 lakh for the same stent.",
      },
    ],
  },
  {
    stage: "ML_ANALYSIS",
    cards: [
      {
        icon: "🤖",
        title: "AI analysis running",
        content: "Our AI has been trained on thousands of Indian hospital bills. It is looking for patterns that human auditors might miss.",
      },
      {
        icon: "📊",
        title: "Risk assessment",
        content: "We calculate the probability that each charge is legitimate based on the bill profile, insurance type, and hospital category.",
      },
    ],
  },
  {
    stage: "FINANCIAL_ANALYSIS",
    cards: [
      {
        icon: "💰",
        title: "Working out your options",
        content: "We are calculating the realistic financial impact and your recovery probability — what you are likely to get back through insurance and dispute.",
      },
      {
        icon: "📄",
        title: "Your complaint letters",
        content: "Based on the findings, we will prepare ready-to-file complaint letters, ombudsman petitions, and if needed, an anti-detention notice.",
      },
    ],
  },
];

export default function ProcessingEducation({ currentStatus }: { currentStatus: string }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // Fallback to EXTRACTING or AUDITING if status is QUEUED or similar
  const normalizedStage =
    currentStatus === "QUEUED"
      ? "EXTRACTING"
      : currentStatus === "GENERATING_REPORT" || currentStatus === "GENERATING_EVIDENCE"
      ? "FINANCIAL_ANALYSIS"
      : currentStatus;

  const stageCards =
    EDUCATIONAL_CARDS.find((s) => s.stage === normalizedStage)?.cards ||
    EDUCATIONAL_CARDS[0].cards;

  useEffect(() => {
    if (!stageCards || stageCards.length === 0) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCardIndex((prev) => (prev + 1) % stageCards.length);
        setVisible(true);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, [stageCards]);

  if (!stageCards || stageCards.length === 0) return null;
  const card = stageCards[cardIndex % stageCards.length];

  return (
    <div
      className={`transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="bg-[#DBF1F4]/50 border border-[#79C5CD]/40 rounded-2xl p-4 mt-6 max-w-md mx-auto text-left shadow-xs">
        <p className="text-2xl mb-1.5">{card.icon}</p>
        <p className="font-heading font-bold text-xs sm:text-sm text-[#202128]">
          {card.title}
        </p>
        <p className="font-body text-xs text-[#606470] mt-1 leading-relaxed">
          {card.content}
        </p>
      </div>
    </div>
  );
}
