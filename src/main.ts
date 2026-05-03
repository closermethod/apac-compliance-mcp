/**
 * APAC Compliance MCP Server v1.0
 * MCP server for AI agents selling into Asia-Pacific markets.
 * 7 tools, 8 countries.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const COUNTRY_BRIEFS: Record<string, any> = {
  japan: {
    market: "Japan", flag: "🇯🇵",
    buyer_psychology: "Lifetime employment culture. Consensus-driven (nemawashi/ringi). Risk-averse, formality-first, long-term relationship oriented. Decisions never rushed.",
    communication_style: "Highly formal at first. Use proper honorifics (-san, -sama). Bow culture even on Zoom. Indirect communication — 'maybe difficult' = no.",
    what_works: ["Patience over months/years for enterprise","Detailed documentation in Japanese","Senior-to-senior introductions (the meishi exchange protocol)","Kaisya-name-first introductions, surname-only thereafter","Group consensus building before final 'yes'","Quality and precision over speed"],
    what_kills_deals: ["Direct 'will you buy?' questions","Western pressure tactics","Rushing the relationship","Showing impatience","First-name basis without invitation","English-only communication for traditional industries"],
    sales_cycle: "6-18 months for enterprise. 3-9 months for SMB. Decisions involve nemawashi (groundwork) + ringi (formal proposal circulation).",
    compliance_note: "Personal Information Protection Act (APPI). Recently strengthened. Cross-border data transfer needs explicit consent.",
    optimal_outreach_times: "Tuesday-Thursday, 9am-11am or 1pm-4pm JST. Avoid early morning + after 6pm.",
    seasonal_warnings: "Golden Week (late Apr-early May), Obon (mid-Aug), New Year (Dec 28 - Jan 5) all dead."
  },
  singapore: {
    market: "Singapore", flag: "🇸🇬",
    buyer_psychology: "Pragmatic, English-fluent, fast cycles. Multicultural (Chinese-Malay-Indian-Western). Trust efficiency and clarity. Strong rule-of-law expectation.",
    communication_style: "Direct but courteous. English standard. Mix of Western directness with Asian respect for hierarchy.",
    what_works: ["Concise English communication","Quick decisions, clear pricing","Government-grant / regulator-friendly framing","Cross-border (US/UK/AU) case studies","Online demos work well","ASEAN regional positioning"],
    what_kills_deals: ["Vague pricing","Too much enthusiasm or fluff","Ignoring race/religion sensitivities","Not understanding MOM regulations","Slow response times"],
    sales_cycle: "1-3 months SMB, 3-6 months enterprise. Among the fastest in APAC.",
    compliance_note: "PDPA (Personal Data Protection Act). DNC Registry for marketing. Spam Control Act on email.",
    optimal_outreach_times: "Tuesday-Thursday, 10am-12pm or 2pm-5pm SGT. Government calendar = many public holidays.",
    seasonal_warnings: "Chinese New Year (Jan/Feb), Hari Raya, Deepavali — check Singapore public holidays."
  },
  korea: {
    market: "South Korea", flag: "🇰🇷",
    buyer_psychology: "Hierarchical (chaebol culture). Relationship-driven (jeong). Confucian respect for age/status. Quality and brand obsessed.",
    communication_style: "Formal initially, with proper honorifics (-님). 'Ppalli ppalli' (fast fast) culture but hierarchy must be respected. Drinking culture for relationship building.",
    what_works: ["Senior-to-senior introductions","Demonstrating commitment to long-term presence","Korean-language materials for non-international companies","Using 'we' over 'I' (collectivism)","Brand-name customer references","Patient persistence — they test commitment"],
    what_kills_deals: ["Disrespecting hierarchy (skipping levels)","Refusing dinner/drinking culture invitations","Being too casual","English-only outreach for traditional Korean firms","Rushing past pleasantries"],
    sales_cycle: "3-9 months for enterprise. Chaebol decisions can take 12+ months. SMB faster (1-3 mo).",
    compliance_note: "Personal Information Protection Act (PIPA). Strict on cross-border transfer. KCC enforcement.",
    optimal_outreach_times: "Tuesday-Thursday, 10am-12pm or 2pm-5pm KST. Avoid Friday afternoons.",
    seasonal_warnings: "Lunar New Year (Seollal, Jan/Feb), Chuseok (Sep/Oct), summer vacation (late Jul-mid Aug)."
  },
  india: {
    market: "India", flag: "🇮🇳",
    buyer_psychology: "Relationship-driven, price-sensitive, consensus-oriented. Family-business culture in many sectors. Long meetings, lots of follow-up. Federal — state variations matter (Mumbai vs Bangalore vs Delhi vs Chennai).",
    communication_style: "Warm and personal. English fluent in business contexts. Indirect 'no' — 'we'll think about it' often means no. Negotiation expected.",
    what_works: ["Building personal rapport before business","Flexible pricing (negotiation IS expected)","Mobile-first outreach (WhatsApp business common)","Local references in same city/region","Showing patience with bureaucracy","Handling multi-stakeholder approvals"],
    what_kills_deals: ["Inflexibility on pricing/terms","Ignoring relationship investment","Skipping the small talk","Not understanding state-level differences","Underestimating procurement length"],
    sales_cycle: "3-9 months. Government-related: 6-18 months. Procurement complex.",
    compliance_note: "Digital Personal Data Protection Act 2023. SPDI Rules. State-specific shops & establishments laws.",
    optimal_outreach_times: "Tuesday-Friday, 10:30am-12:30pm or 3pm-6pm IST. Avoid Monday mornings.",
    seasonal_warnings: "Diwali (Oct/Nov), Holi (March), Q4 (Jan-Mar) is fiscal year-end push, monsoon season slow."
  },
  australia: {
    market: "Australia", flag: "🇦🇺",
    buyer_psychology: "Direct, egalitarian, anti-hierarchy. 'Tall poppy syndrome' — distrust self-promotion. Practical, value-driven.",
    communication_style: "Casual-direct. First names always. Humor and self-deprecation valued. No corporate fluff.",
    what_works: ["Casual confidence (not arrogant)","Australian / NZ case studies","Cricket/footy references appropriate","Practical demos over slides","Beer-with-the-boss informality at senior levels","Respecting work-life balance"],
    what_kills_deals: ["Bragging or excessive self-promotion","Formal corporate-speak","Ignoring the 'fair go' value","Calling outside business hours","Being too American (sales-y) — they smell it instantly"],
    sales_cycle: "2-4 months SMB, 4-8 months enterprise. Federal/state govt slower.",
    compliance_note: "Privacy Act 1988 + Australian Privacy Principles. Spam Act 2003 for email. Do Not Call Register.",
    optimal_outreach_times: "Tue-Thu, 9-11am or 1-4pm AEST. Avoid Friday afternoons + school holidays.",
    seasonal_warnings: "Christmas-New Year (mid-Dec to mid-Jan) effectively dead. Easter long weekend. Footy finals season impacts attention in Sep-Oct."
  },
  hongkong: {
    market: "Hong Kong", flag: "🇭🇰",
    buyer_psychology: "Fast-moving financial hub. East-meets-West. Pragmatic + relationship-driven. Strong British colonial business heritage with modern Asian sensibilities.",
    communication_style: "English-Cantonese bilingual. Formal in writing, friendly in person. Status-aware (which firm, which floor in IFC).",
    what_works: ["Quick, sharp pitches","Cantonese-friendly business cards/materials","Lunch meetings (yum cha culture)","Financial services positioning","Cross-border references (esp. US, UK, China)","Speed to deal"],
    what_kills_deals: ["Mainland China-specific approaches (politically sensitive post-2020)","Slow follow-up","Not respecting time zones (HK juggles US + Europe + Asia)","Confusing HK with mainland China"],
    sales_cycle: "1-4 months SMB, 3-6 months enterprise. Faster than most APAC.",
    compliance_note: "Personal Data Privacy Ordinance (PDPO). Spam: Unsolicited Electronic Messages Ordinance.",
    optimal_outreach_times: "Tue-Fri, 9am-11am or 2pm-5pm HKT. Many in office until 7-8pm.",
    seasonal_warnings: "Chinese New Year (Jan/Feb), Easter, October Golden Week impact."
  },
  taiwan: {
    market: "Taiwan", flag: "🇹🇼",
    buyer_psychology: "Tech-heavy economy (TSMC and ecosystem). Relationship-warm, less hierarchical than Korea/Japan but more than HK. Mandarin-Taiwanese bilingual.",
    communication_style: "Friendly-formal. Use of LINE messenger common in business. Mandarin Chinese standard for traditional firms.",
    what_works: ["Tech-supply-chain references","Traditional Mandarin (NOT simplified)","LINE messenger for follow-ups","Building genuine relationships","Patience and politeness","Foodie culture — meals matter"],
    what_kills_deals: ["Simplified Chinese characters (signals mainland)","Calling Taiwan 'China' (sensitive)","Pushing too hard","Skipping the meal invitation","Ignoring tech-stack alignment"],
    sales_cycle: "2-6 months SMB, 4-9 months enterprise.",
    compliance_note: "Personal Data Protection Act (PDPA). Spam regulations under Telecommunications Act.",
    optimal_outreach_times: "Tue-Thu, 9am-12pm or 2pm-5pm TWT. Many work late.",
    seasonal_warnings: "Lunar New Year (Jan/Feb), Tomb Sweeping (April), Mid-Autumn Festival (Sep/Oct)."
  },
  indonesia: {
    market: "Indonesia", flag: "🇮🇩",
    buyer_psychology: "Relationship-first, hierarchical, religion-conscious (largely Muslim). Patience essential. Bahasa Indonesia for non-international companies.",
    communication_style: "Warm and respectful. Use of Bapak/Ibu (Mr/Mrs). Indirect communication. Smiling can mean discomfort, not agreement.",
    what_works: ["Building trust over multiple meetings","Bahasa Indonesia materials","Respecting prayer times (5x daily)","Halal-friendly business practices","Family-business cultural awareness","Long-term presence signals"],
    what_kills_deals: ["Arrogant Western approach","Ignoring religious sensitivities","Underestimating bureaucracy","Direct confrontation","Female sales reps without local cultural prep (varies)"],
    sales_cycle: "4-10 months SMB, 6-12 months enterprise. Lots of meetings.",
    compliance_note: "Personal Data Protection Law (PDP) 2022. ITE Law on electronic transactions. KOMINFO regulations.",
    optimal_outreach_times: "Tue-Thu, 9am-11am or 1pm-3pm WIB (avoid prayer times: ~12-1pm, ~3-3:30pm).",
    seasonal_warnings: "Ramadan (varies, lunar) — slow business hours. Eid al-Fitr week. Lunar New Year for Chinese-Indonesian firms."
  }
};

const OUTREACH_TEMPLATES: Record<string, Record<string, any>> = {
  japan: {
    cold_email: { subject: "[Specific topic] のご相談", body: "Sehr geehrte/r [Last Name]-sama,\n\nI am writing regarding [specific business observation]. We work with [industry] companies on [outcome] and believe there may be value for [Company].\n\nI would be honored to schedule a brief introductory meeting at your convenience. Please find attached our company introduction.\n\nWith deepest respect,\n[Your name]\n[Title], [Company]", psychology: "Formal Japanese business letter convention. Use of -sama signals respect." }
  },
  singapore: {
    cold_email: { subject: "Quick Q for [Company]", body: "Hi [Name],\n\nStraight to the point: we help [industry] companies in Singapore with [outcome]. Recent reference: [Company X result].\n\nQuick 15-min call to see if there's a fit?\n\nThanks,\n[Your name]", psychology: "SG values directness + clarity. Get to the point." }
  },
  korea: {
    cold_email: { subject: "[Company]님 안녕하세요", body: "안녕하세요 [Name]-님,\n\n[Company] regarding [specific topic]. We work with similar Korean enterprises on [outcome], including reference clients [X, Y].\n\nWould a brief meeting at your convenience be possible?\n\n감사합니다,\n[Your name]", psychology: "Korean honorifics + group reference (we) + brand customers." }
  },
  india: {
    cold_email: { subject: "Quick chat about [topic] for [Company]?", body: "Hello [Name],\n\nHope you're doing well. I came across [Company] and was impressed by [specific observation].\n\nWe help [industry] companies in India with [outcome]. Pricing is flexible and we work with companies of all sizes.\n\nWould a 15-min call work? I'm flexible on timing.\n\nWarm regards,\n[Your name]", psychology: "Warmth + flexibility on pricing (expected) + 'flexible on timing' shows respect." }
  },
  australia: {
    cold_email: { subject: "G'day [Name] — quick Q", body: "G'day [Name],\n\nNoticed [Company] is doing [specific thing] — really impressive.\n\nWe help similar Aussie businesses with [outcome]. No fluff. Worth a quick chat?\n\nCheers,\n[Your name]", psychology: "G'day opener (used naturally), no fluff, 'cheers' close. Casual confidence." }
  },
  hongkong: {
    cold_email: { subject: "Quick — [Company] + [outcome]?", body: "Hi [Name],\n\nFollowing [Company]'s recent [trigger]. We work with similar HK firms on [outcome] — quick numbers from a recent client: [result].\n\nWorth 15 min this week?\n\nBest,\n[Your name]", psychology: "Numbers-driven, fast-paced, time-respecting." }
  },
  taiwan: {
    cold_email: { subject: "[Company] 您好", body: "您好 [Name],\n\n[Company] regarding [specific topic]. We work with similar Taiwan tech firms on [outcome].\n\nWould a brief LINE call or meeting work for you?\n\n敬上,\n[Your name]", psychology: "Traditional Mandarin opener. Mention LINE (preferred messenger)." }
  },
  indonesia: {
    cold_email: { subject: "Salam [Name] — [topic]", body: "Salam Bapak/Ibu [Last Name],\n\nWe are reaching out regarding [specific topic]. We work with companies in [industry] on [outcome] and would welcome the opportunity to introduce ourselves.\n\nMay we schedule a brief meeting at your convenience?\n\nTerima kasih,\n[Your name]", psychology: "Bapak/Ibu (Mr/Mrs) formal address. Terima kasih (thank you)." }
  }
};

const ETIQUETTE_GUIDES: Record<string, any> = {
  japan: { meishi_protocol: "Business cards exchanged with both hands, slight bow. Read the card carefully. Place it on the table during the meeting — never in pocket.", gift_culture: "Modest gifts when visiting (omiyage). Wrap matters more than content. Avoid sets of 4 (death).", drinking_culture: "Nomikai bonding important. Pour for others, never yourself. Refusal possible but signals distance.", silence: "Comfortable with silence — don't fill it." },
  singapore: { meishi_protocol: "Bilingual cards (English + Chinese for Chinese contacts) appreciated.", gift_culture: "Modest, practical gifts. Avoid clocks (Chinese), pork products, alcohol if Muslim.", communication: "Direct OK, but always with respect. 'Lah' OK after rapport." },
  korea: { meishi_protocol: "Hand and receive cards with both hands, slight bow. Senior person initiates.", gift_culture: "Modest gifts, wrapped. Liquor (whiskey) appreciated for senior contacts. Avoid green hats (cultural taboo).", drinking_culture: "Soju/beer culture for relationship. Pour for others. 'One-shot' culture — pace yourself.", hierarchy: "Always defer to most senior person — eye contact, who speaks first, seating." },
  india: { meeting_protocol: "Namaste greeting acceptable. Handshakes increasingly common. Family chat first.", gift_culture: "Modest gifts. Avoid leather (Hindu/Jain) and pork (Muslim). Sweets appreciated.", food_culture: "Vegetarianism common. Don't assume.", time_orientation: "Indian Standard Time = often delayed. Patience." },
  australia: { meeting_protocol: "First names immediately. Handshake firm. No bowing.", gift_culture: "Not really expected for business. Wine OK if invited home.", communication: "Casual humor. Banter expected. Self-deprecation appreciated." },
  hongkong: { meishi_protocol: "Bilingual (English + Traditional Chinese). Both hands.", gift_culture: "Avoid clocks, white flowers, sets of 4. Red appreciated for festivities.", food_culture: "Yum cha lunch meetings effective. Decline politely 3 times before accepting (cultural expectation)." },
  taiwan: { meishi_protocol: "Traditional Chinese characters preferred. Both hands.", gift_culture: "Tea, fruit baskets standard. Avoid clocks, white flowers.", food_culture: "Long meals expected. Hosts pay (alternation builds relationship)." },
  indonesia: { meeting_protocol: "Right hand for greetings/handshakes (left hand unclean culturally). Use Bapak/Ibu.", gift_culture: "Avoid pork, alcohol, leather to Muslim contacts. Sweets/snacks appreciated.", religious_awareness: "Halal food considerations. Prayer time accommodations.", communication: "Avoid direct 'no'. Smile can mask discomfort." }
};

const FOLLOWUP_CADENCES: Record<string, any> = {
  japan: { pacing: "Slow, formal. 7-14 day gaps. Multiple touches expected.", rules: ["Never push","Each follow-up should add value or ask permission","Long-term relationship orientation"] },
  singapore: { pacing: "Fast, 2-3 day gaps. Direct questions.", rules: ["Yes/no questions get answered","Respect time","Maximum 3-4 touches before backing off"] },
  korea: { pacing: "Patient but persistent. 5-7 day gaps. Multi-stakeholder.", rules: ["Always go through proper channels","Don't skip hierarchy","Use jeong (relational warmth)"] },
  india: { pacing: "Multiple touches (5-10) expected. 4-7 day gaps. WhatsApp follow-ups acceptable.", rules: ["Persistence is normal — not annoying","Pricing flexibility communicated","Mobile-first"] },
  australia: { pacing: "2-4 touches over 3 weeks. 5-7 day gaps. Casual.", rules: ["No corporate fluff","Respect work-life balance","Self-deprecation in follow-ups OK"] },
  hongkong: { pacing: "Fast, 2-4 day gaps.", rules: ["Numbers and references in every follow-up","Time-respect crucial","Speed signals seriousness"] },
  taiwan: { pacing: "Friendly-paced, 4-7 day gaps. LINE follow-ups acceptable.", rules: ["Maintain warmth","Reference shared meals or context","Don't pressure"] },
  indonesia: { pacing: "Slow, 7-10 day gaps. Multiple meetings expected.", rules: ["Patience over months","Build trust over deals","Religious awareness in timing"] }
};

const STAKEHOLDER_MAP: Record<string, any> = {
  early_startup: { decision_maker: "Founder / Managing Director", influencer: "Co-founder or Head of Function", apac_note: "In Korea/Japan, founder may defer to family elder/board.", cycle: "1-3 months", deal_size: "$3K-30K" },
  growth_stage: { decision_maker: "CEO + functional VP", influencer: "Department head", apac_note: "Korea: chaebol-affiliated startups still defer to parent. Japan: ringi system.", cycle: "3-6 months", deal_size: "$15K-150K" },
  mid_market: { decision_maker: "C-suite + procurement + legal", influencer: "Multiple department heads", apac_note: "India: state government affairs may matter. Indonesia: family business dynamics.", cycle: "6-12 months", deal_size: "$50K-500K" },
  enterprise: { decision_maker: "C-suite + board approval + procurement + legal + IT + sometimes regulator alignment", influencer: "Project lead + multiple stakeholders + external consultants", apac_note: "Japan: nemawashi (groundwork) + ringi (formal proposal). Korea chaebol: 12-18 months. India: complex multi-state procurement.", cycle: "9-24 months", deal_size: "$200K-5M" }
};

const COMPLIANCE_CHECKS: Record<string, any> = {
  japan: { framework: "Personal Information Protection Act (APPI) — recently strengthened. Cross-border transfer requires explicit consent.", regulator: "PPC (Personal Information Protection Commission)", risks: "Fines + reputational damage in name-and-shame culture", spam_law: "Specified Commercial Transactions Act + Anti-Spam Law" },
  singapore: { framework: "PDPA + Spam Control Act + Do Not Call (DNC) Registry", regulator: "PDPC", risks: "Fines up to S$1M + 3% turnover for serious breaches", spam_law: "Strict opt-in for SG numbers" },
  korea: { framework: "Personal Information Protection Act (PIPA)", regulator: "PIPC + KCC", risks: "High fines, name-and-shame, criminal liability for directors", spam_law: "K-ISMS + IT Network Act" },
  india: { framework: "DPDP Act 2023 + state-level laws", regulator: "Data Protection Board of India (forming)", risks: "Up to ₹250 crore fines for serious breaches", spam_law: "TRAI DLT registration for SMS/voice" },
  australia: { framework: "Privacy Act 1988 + Australian Privacy Principles", regulator: "OAIC", risks: "Up to A$50M / 30% turnover for serious breaches (post-2022 reforms)", spam_law: "Spam Act 2003 — strict consent + identification" },
  hongkong: { framework: "Personal Data Privacy Ordinance (PDPO)", regulator: "PCPD", risks: "Fines + criminal liability", spam_law: "Unsolicited Electronic Messages Ordinance — strict identification rules" },
  taiwan: { framework: "Personal Data Protection Act (PDPA Taiwan version)", regulator: "MoJ + sector regulators", risks: "Fines + criminal liability for serious cases", spam_law: "Telecommunications Act + UEM rules" },
  indonesia: { framework: "PDP Law 2022 + ITE Law", regulator: "KOMINFO + future PDP Authority", risks: "Up to 2% global turnover fines + criminal", spam_law: "ITE Law + telco regulations" }
};

const server = new Server({ name: "apac-compliance-mcp", version: "1.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: "get_country_brief", description: "Country-specific APAC buyer psychology, communication style, what works/kills, sales cycle, compliance, optimal times, seasonal warnings.", inputSchema: { type: "object", properties: { country: { type: "string", enum: Object.keys(COUNTRY_BRIEFS) } }, required: ["country"] } },
    { name: "get_outreach_template", description: "Country-specific outreach templates calibrated to local norms (Japanese formality, Aussie casualness, Indonesian Bapak/Ibu, etc.).", inputSchema: { type: "object", properties: { country: { type: "string", enum: Object.keys(OUTREACH_TEMPLATES) }, channel: { type: "string", enum: ["cold_email"] } }, required: ["country", "channel"] } },
    { name: "get_followup_cadence", description: "Country-specific follow-up cadence (Japan slow + 14d gaps, Singapore fast + 2d gaps, India persistent + 5-10 touches).", inputSchema: { type: "object", properties: { country: { type: "string", enum: Object.keys(FOLLOWUP_CADENCES) } }, required: ["country"] } },
    { name: "get_etiquette_guide", description: "Business etiquette per country: meishi protocol, gift culture, drinking culture, hierarchy norms, religious awareness.", inputSchema: { type: "object", properties: { country: { type: "string", enum: Object.keys(ETIQUETTE_GUIDES) } }, required: ["country"] } },
    { name: "get_stakeholder_map", description: "Stakeholder navigation map by company stage. APAC-specific notes (chaebol, nemawashi, family-business dynamics).", inputSchema: { type: "object", properties: { company_stage: { type: "string", enum: Object.keys(STAKEHOLDER_MAP) } }, required: ["company_stage"] } },
    { name: "get_compliance_check", description: "Country-specific compliance: data protection framework, regulator, risks, spam law.", inputSchema: { type: "object", properties: { country: { type: "string", enum: Object.keys(COMPLIANCE_CHECKS) } }, required: ["country"] } },
    { name: "get_full_apac_pack", description: "Complete APAC pack for fine-tuning or full agent context.", inputSchema: { type: "object", properties: {}, required: [] } }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const country = args?.country as string;
  switch (name) {
    case "get_country_brief": { const d = COUNTRY_BRIEFS[country]; if (!d) throw new Error(`Unknown country: ${country}`); return { content: [{ type: "text", text: JSON.stringify({ module: "APAC Country Brief", ...d }, null, 2) }] }; }
    case "get_outreach_template": { const channel = args?.channel as string; const d = OUTREACH_TEMPLATES[country]?.[channel]; if (!d) throw new Error(`No template for ${country}/${channel}`); return { content: [{ type: "text", text: JSON.stringify({ module: "APAC Outreach Template", country, channel, ...d }, null, 2) }] }; }
    case "get_followup_cadence": { const d = FOLLOWUP_CADENCES[country]; if (!d) throw new Error(`Unknown: ${country}`); return { content: [{ type: "text", text: JSON.stringify({ module: "APAC Follow-Up Cadence", country, ...d }, null, 2) }] }; }
    case "get_etiquette_guide": { const d = ETIQUETTE_GUIDES[country]; if (!d) throw new Error(`Unknown: ${country}`); return { content: [{ type: "text", text: JSON.stringify({ module: "APAC Business Etiquette", country, ...d }, null, 2) }] }; }
    case "get_stakeholder_map": { const stage = args?.company_stage as string; const d = STAKEHOLDER_MAP[stage]; if (!d) throw new Error(`Unknown stage: ${stage}`); return { content: [{ type: "text", text: JSON.stringify({ module: "APAC Stakeholder Map", company_stage: stage, ...d }, null, 2) }] }; }
    case "get_compliance_check": { const d = COMPLIANCE_CHECKS[country]; if (!d) throw new Error(`Unknown: ${country}`); return { content: [{ type: "text", text: JSON.stringify({ module: "APAC Compliance Check", country, disclaimer: "General guidance, not legal advice.", ...d }, null, 2) }] }; }
    case "get_full_apac_pack": { return { content: [{ type: "text", text: JSON.stringify({ pack: "APAC Compliance MCP Complete v1.0", author: "Elisabeth Hitz", modules: { country_briefs: COUNTRY_BRIEFS, outreach_templates: OUTREACH_TEMPLATES, etiquette_guides: ETIQUETTE_GUIDES, followup_cadences: FOLLOWUP_CADENCES, stakeholder_map: STAKEHOLDER_MAP, compliance_checks: COMPLIANCE_CHECKS } }, null, 2) }] }; }
    default: throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() { const t = new StdioServerTransport(); await server.connect(t); console.error("APAC Compliance MCP Server v1.0 running..."); }
main().catch(console.error);
