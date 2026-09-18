# TallyUp — product brief for landing page

**What it is:** TallyUp is a digital loyalty punch card for small, independent
shops (cafes, delis, small retail). Customers earn points by checking in with
just a phone number, no app to download; staff confirm each visit from a
simple dashboard; customers redeem a reward once they hit the shop's chosen
threshold. Tagline: "The punch card, without the paper."

**Live at:** hellotallyup.com. Currently in an early, free pilot phase with a
small handful of local shops testing it at the register — not yet a paid
product, no pricing page exists yet.

## The problem / market context

Small shops rarely have a loyalty program at all, not because they don't want
one, but because the market is built for chains, not corner stores:

- **Fivestars** starts around $299/month, with implementation costs that run
  roughly $500 for small businesses up to $5,000+ for larger ones.
- **Clover** ties its rewards program to its own proprietary hardware (a
  Clover Mini terminal runs $799-$899, Clover Flex is $749 outright or
  $40/mo), typically bundled into 36-month contracts.
- **Square Loyalty** is comparatively affordable ($45/mo per location) but
  only works if you're already running Square's own POS system.
- Industry-wide, initial loyalty-program setup commonly runs $10,000-$60,000+,
  with monthly software fees of $50-$500 for mid-tier platforms and
  $399-$1,500/month at the enterprise tier.

The common thread: hardware lock-in, multi-year contracts, or fees sized for
chains. A shop running on thin margins usually just ends up with a paper
card, or nothing.

## How TallyUp works

1. **Scan** — the shop prints one QR code (generated in-app, with the
   business name on it) and tapes it by the register. A customer scans it on
   their own phone and types their number. Five seconds, nothing to install.
2. **Confirm** — the check-in sits as "pending" until a staff member taps
   Confirm in person. This is the fraud gate: nobody can award themselves a
   point without a real staff interaction.
3. **Redeem** — the shop sets its own reward and how many visits it takes
   (e.g., free coffee after 10 visits). Extra points roll over past the
   threshold rather than being lost.

## Full feature set

- **For customers:** phone-number check-in (no signup, no app), a persistent
  view of their own progress, and a public lookup at hellotallyup.com/card
  where anyone can check their punch balance at every shop they use TallyUp
  at, just by typing their number, no login, before ever walking in.
- **For shop owners:** a live dashboard (check-ins, new customers, rewards
  given this week), a full customer list exportable as CSV anytime, staff
  email invitations with role-based access (owner vs. staff), editable
  reward settings, and a business logo upload.
- **For staff:** a read-only view with the ability to confirm check-ins and
  redemptions; owners can promote scope but staff can't touch business
  settings.
- **General:** fully mobile-first, works in any phone's browser (customer
  and staff side alike), light/dark mode, no hardware beyond a phone.

## Differentiators (for landing page positioning)

- No proprietary hardware to buy.
- No long-term contract.
- No app for customers or staff to install.
- Setup is minutes, not the multi-week onboarding typical of the incumbents
  above.
- Built and run by one person, currently free during the pilot.

## Brand identity

- **Name:** TallyUp. **Tagline:** "The punch card, without the paper."
- **Existing hook line** (from current landing page copy): "Reward your
  regulars without the stamps, the lost cards, or the hole punch."
- **Typography:** Space Grotesk (headings, weight 700) paired with Archivo
  (body text) — both via Google Fonts.
- **Color palette** — two themes, both already implemented in the live app:
  - *Light ("Chalk & Indigo")*: background `#eef1f6`, surface `#e2e7ef`, ink
    `#1c2230`, accent (indigo) `#4f5fd1`, secondary accent (orange)
    `#d98a4a`.
  - *Dark ("Slate & Coral")*: background `#23303a`, surface `#2c3c47`, ink
    `#f1ede4`, accent (coral) `#ef7a5a`, secondary accent (gold) `#d9b46a`.
- **Logo mark:** a rounded punch-card icon with five circular "punch dots"
  in green (`#8fa073`), three small sparkle strokes above it, and a small
  orange circular checkmark badge overlapping the bottom-right corner
  (signifying "confirmed"). It's a simple inline SVG in the app, easy to
  recreate.
- **Voice:** plain, warm, concrete over clever. No em dashes or en dashes
  anywhere in user-facing copy (a hard style rule in the app itself) —
  recast sentences with a period, comma, colon, or semicolon instead. Avoid
  corporate/hype language; specific beats vague ("just a phone number," not
  "seamless frictionless onboarding").

## Target audience

Independent small-business owners: cafes, delis, coffee shops, small
retail — the kind of shop that currently either has a paper punch card or
nothing. Messaging should speak to an owner personally, not a franchise or
enterprise buyer.

## Reference copy already written (reusable/adaptable)

A one-page pitch flyer and a LinkedIn post already exist with tested
phrasing around this exact positioning (the "expensive incumbents" market
framing above came directly from one of them) — if useful, the new session
can riff on: "Free for the pilot. Nothing changes without talking to you
first," "Just a phone number. No name or email required to join," and
"Export your full customer list any time. Nothing locks you in" as
FAQ-style trust copy.
