import { LegalPage } from '../components/LegalPage';

export function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="September 2026">

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>From shop owners and staff:</strong> your email address, and the business details you enter (name,
          reward, logo).
        </li>
        <li>
          <strong>From customers:</strong> the phone number they type at check-in, their visit count and rewards, and
          (only if they tick the box) a record that they agreed to receive texts, with the date and the exact
          wording they saw.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        To run the punch card: showing your staff the check-in queue, tracking points, and letting you see and export
        your own customer list. Phone numbers are shown to staff in masked form (last four digits), except at the
        moment of check-in and for a customer who has opted in to text messages, whose full number is shown to staff
        and included in exports.
      </p>
      <p>
        We also look at how often the check-in button and the staff Confirm button get used, so we know whether the
        product is actually helping. See "How we measure usage" below for exactly what that involves.
      </p>

      <h2>How we measure usage</h2>
      <p>
        We use two outside services for this, and neither one gets your customers' phone numbers or any way to
        identify a specific person.
      </p>
      <p>
        Vercel Analytics counts page visits on most of the site, so we can see things like how many people land on
        the homepage. It's turned off entirely on the check-in page and the punch-balance lookup page: those two
        screens get no visitor tracking of any kind.
      </p>
      <p>
        PostHog counts two things, and only two things: how often the check-in button gets used, and how often a
        staff member taps Confirm. Each is a plain tally with no name, phone number, or other detail attached, and
        PostHog is set up to never build a profile of who did the clicking.
      </p>

      <h2>Checking a punch balance</h2>
      <p>
        A customer can look up their own punch balance at any TallyUp shop by entering their phone number, no
        account needed. Anyone who knows that number can do the same lookup. That page only ever shows a shop name
        and a punch count. It never shows a name, an address, when someone visited, or any way to contact them.
      </p>
      <p>
        If you look up a number on that page, your browser remembers it on your own device so you don't have to
        retype it next time. That number never leaves your device for this. You can clear it any time by clearing
        your browser's site data for TallyUp.
      </p>

      <h2>What we don't do</h2>
      <ul>
        <li>We don't sell customer data or share it with other businesses.</li>
        <li>We don't text your customers yet. Consent is collected now so that feature is possible later; nothing is
          sent until it exists, and every message will include a way to opt out.</li>
        <li>We don't run any visitor tracking on the check-in page or the punch-balance lookup page.</li>
      </ul>

      <h2>Where it lives</h2>
      <p>
        Data is stored with our hosting provider (Supabase, on infrastructure in the United States). Page-visit and
        button-click counts are processed by Vercel and PostHog. Access to your data is restricted to the TallyUp
        team and your own staff accounts.
      </p>

      <h2>Deleting your data</h2>
      <p>
        Ask us to delete your business and we'll remove it and its customer records. A customer who wants their
        number removed can ask you, and you can pass that request along to us.
      </p>

      <h2>Contact</h2>
      <p>Privacy questions: reach out to the person who invited you to the pilot.</p>
    </LegalPage>
  );
}
