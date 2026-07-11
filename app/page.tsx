import {
  ArrowRightIcon,
  BanIcon,
  CalendarDaysIcon,
  CheckIcon,
  ClockIcon,
  HeartHandshakeIcon,
  LinkIcon,
  LockKeyholeIcon,
  MessageCircleIcon,
  PencilLineIcon,
  PinIcon,
  PlusIcon,
  ShieldCheckIcon,
  UsersRoundIcon,
} from "lucide-react";

import { createRosterAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const flowSteps = [
  {
    icon: LinkIcon,
    number: "1",
    title: "Delen",
    label: "voor iedereen",
    copy: "Zet de bezoekerslink in de groepsapp. Iedereen kan meekijken en een moment kiezen.",
  },
  {
    icon: PencilLineIcon,
    number: "2",
    title: "Plannen",
    label: "voor jezelf",
    copy: "Wie langskomt krijgt een eigen link om het bezoek later aan te passen of te annuleren.",
  },
  {
    icon: LockKeyholeIcon,
    number: "3",
    title: "Beheren",
    label: "voor familie",
    copy: "Met de beheerlink voeg je rustmomenten, notities en blokkades toe wanneer dat nodig is.",
  },
];

const detailCards = [
  {
    icon: MessageCircleIcon,
    title: "Deel met een klik",
    copy: "Een WhatsApp-bericht met de juiste link staat meteen klaar.",
  },
  {
    icon: CalendarDaysIcon,
    title: "Vrije tijden vallen op",
    copy: "Lege momenten zijn zichtbaar, zodat iemand ze makkelijk kan vullen.",
  },
  {
    icon: BanIcon,
    title: "Blokkeer rust",
    copy: "Zet behandelingen, rust of bezoekvrije uren vast in het rooster.",
  },
  {
    icon: PencilLineIcon,
    title: "Altijd aanpasbaar",
    copy: "Bezoekers beheren hun eigen afspraak zonder account of wachtwoord.",
  },
];

const calendarCells = [
  "29",
  "30",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "1",
  "2",
];

const bookedIndexes = new Set([8, 11, 15, 18, 22, 25, 30]);
const mutedIndexes = new Set([0, 1, 33, 34]);

export default function HomePage() {
  return (
    <main className="min-h-svh bg-[#f5f3f2] text-[#333333]">
      <NavBar />
      <HeroSection />
      <LinkFlowSection />
      <ProductSection />
      <DetailsSection />
      <MobileStorySection />
      <FinalCtaSection />
    </main>
  );
}

function NavBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#f5f3f2] bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-6">
        <a
          href="#top"
          className="flex items-center gap-2 text-sm font-bold tracking-normal"
        >
          <HeartHandshakeIcon className="size-5 text-[#7366fe]" />
          Bezoekje
        </a>
        <div className="flex items-center gap-4">
          <a
            href="#details"
            className="hidden text-sm font-medium tracking-[0.167em] text-[#333333] transition hover:text-[#7366fe] md:block"
          >
            HOE HET WERKT
          </a>
          <AvatarStack />
        </div>
      </nav>
    </header>
  );
}

function HeroSection() {
  return (
    <section
      id="top"
      className="mx-auto flex w-full max-w-[1200px] flex-col items-center px-6 pb-20 pt-16 text-center md:pb-24 md:pt-20"
    >
      <Eyebrow>BEZOEK AFSPREKEN</Eyebrow>
      <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-none tracking-normal text-[#333333] md:text-[64px]">
        Samen bezoek plannen,
        <br />
        <Highlight>zonder gedoe.</Highlight>
      </h1>
      <p className="mt-6 max-w-2xl text-base font-light leading-7 tracking-[0.14em] text-[#333333] md:text-lg md:tracking-[0.167em]">
        Een rooster, een link. Iedereen ziet wanneer er nog ruimte is en kiest
        zelf een rustig moment om langs te komen.
      </p>

      <CreateRosterForm
        formId="hero-roster-title"
        className="mt-9 w-full max-w-2xl"
      />

      <div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-sm font-medium tracking-[0.167em]">
        <a
          href="#product"
          className="border-b border-[#8b8c96] pb-1 transition hover:border-[#7366fe] hover:text-[#7366fe]"
        >
          BEKIJK VOORBEELD
        </a>
        <a
          href="#details"
          className="inline-flex items-center gap-2 text-[#7366fe]"
        >
          HOE HET WERKT
          <ArrowRightIcon className="size-4" />
        </a>
      </div>

      <div className="mt-16 w-full">
        <RosterMock />
      </div>
    </section>
  );
}

function LinkFlowSection() {
  return (
    <section className="mx-auto grid w-full max-w-[1200px] gap-10 px-6 py-20 lg:grid-cols-[0.8fr_1.4fr] lg:items-center">
      <div>
        <Eyebrow align="left">EEN ROOSTER, DRIE LINKS</Eyebrow>
        <h2 className="mt-5 max-w-lg text-4xl font-bold leading-none tracking-normal md:text-[56px]">
          De link is <Highlight>de sleutel</Highlight>
        </h2>
        <p className="mt-6 max-w-md text-sm font-light leading-7 tracking-[0.14em] md:text-base md:tracking-[0.167em]">
          Geen accounts en geen wachtwoorden. Iedere link geeft precies de
          rechten die iemand nodig heeft, en niets meer.
        </p>
        <a
          href="#details"
          className="mt-8 inline-flex items-center gap-3 border-b border-[#7366fe] pb-2 text-sm font-medium tracking-[0.167em] text-[#7366fe]"
        >
          ZO WERKT HET
          <ArrowRightIcon className="size-4" />
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {flowSteps.map((step) => (
          <FlowCard key={step.title} step={step} />
        ))}
      </div>
    </section>
  );
}

function ProductSection() {
  return (
    <section
      id="product"
      className="overflow-hidden bg-white/55 py-20 md:py-24"
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center px-6 text-center">
        <Eyebrow>HET ROOSTER</Eyebrow>
        <h2 className="mt-5 max-w-4xl text-4xl font-bold leading-none tracking-normal md:text-[56px]">
          Zie meteen waar nog <Highlight>ruimte</Highlight> is
        </h2>
        <p className="mt-6 max-w-2xl text-sm font-light leading-7 tracking-[0.14em] md:text-base md:tracking-[0.167em]">
          Het overzicht laat bezoeken, vrije plekken en rustmomenten naast
          elkaar zien. Op mobiel blijft dezelfde route kort en duidelijk.
        </p>
        <div className="relative mt-14 w-full">
          <div className="absolute left-0 top-16 hidden w-48 -rotate-3 md:block">
            <PhoneMock mode="book" />
          </div>
          <div className="absolute right-0 top-24 hidden w-48 rotate-3 md:block">
            <PhoneMock mode="edit" />
          </div>
          <div className="relative z-10 mx-auto max-w-5xl">
            <RosterMock compact />
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailsSection() {
  return (
    <section
      id="details"
      className="mx-auto grid w-full max-w-[1200px] gap-12 px-6 py-20 lg:grid-cols-[0.9fr_1.25fr] lg:items-start"
    >
      <div className="relative">
        <div className="absolute -left-5 top-0 hidden h-full w-px bg-[#7366fe] lg:block" />
        <p className="absolute -left-8 top-24 hidden -rotate-90 text-xs font-medium tracking-[0.167em] text-[#7366fe] lg:block">
          GEEN ACCOUNTS / GEEN WACHTWOORDEN
        </p>
        <Eyebrow align="left">VOOR ELK BEZOEK</Eyebrow>
        <h2 className="mt-5 text-4xl font-bold leading-none tracking-normal md:text-[56px]">
          Klein genoeg voor iedereen
        </h2>
        <p className="mt-6 max-w-lg text-sm font-light leading-7 tracking-[0.14em] md:text-base md:tracking-[0.167em]">
          Bezoekje is bewust klein. Alles wat nodig is zit erin, zonder extra
          schermen die familieleden moeten leren.
        </p>
        <div className="mt-8 grid gap-5">
          {detailCards.map((card) => {
            const Icon = card.icon;

            return (
              <div key={card.title} className="flex gap-4">
                <Icon className="mt-1 size-6 shrink-0 text-[#7366fe]" />
                <div>
                  <h3 className="text-base font-bold tracking-normal">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 tracking-[0.12em] text-[#333333]">
                    {card.copy}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <DetailMock
          icon={MessageCircleIcon}
          title="Deel in WhatsApp"
          copy="Kom je ook langs? Kies een tijd in ons bezoekrooster."
        >
          <div className="rounded-3xl bg-[#f5f3f2] p-5">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm font-medium tracking-normal">
                Bezoekrooster
              </p>
              <p className="mt-2 break-words text-sm tracking-[0.08em] text-[#7366fe]">
                bezoekje.app/r/abc123
              </p>
            </div>
          </div>
        </DetailMock>
        <DetailMock
          icon={CalendarDaysIcon}
          title="Vrij is duidelijk"
          copy="Beschikbare momenten zijn direct herkenbaar."
        >
          <SlotList />
        </DetailMock>
        <DetailMock
          icon={BanIcon}
          title="Rust blijft rust"
          copy="Blokkeer uren waar niemand hoeft te plannen."
        >
          <div className="rounded-3xl bg-[#d5d1f4]/55 p-5">
            <div className="flex items-center justify-between rounded-2xl bg-white/80 p-4">
              <div>
                <p className="text-sm font-bold tracking-normal">
                  14:00 - 16:00
                </p>
                <p className="mt-1 text-xs tracking-[0.12em] text-[#8b8c96]">
                  RUSTMOMENT
                </p>
              </div>
              <LockKeyholeIcon className="size-5 text-[#7366fe]" />
            </div>
          </div>
        </DetailMock>
        <DetailMock
          icon={PencilLineIcon}
          title="Zelf wijzigen"
          copy="Een persoonlijke link maakt aanpassen simpel."
        >
          <div className="rounded-3xl border border-[#c4c3c1]/60 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold tracking-normal">Maaike</p>
                <p className="text-xs tracking-[0.12em] text-[#8b8c96]">
                  VANDAAG, 15:00
                </p>
              </div>
              <span className="rounded-full bg-[#d5d1f4] px-3 py-1 text-xs font-medium tracking-[0.12em] text-[#7366fe]">
                JIJ
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="rounded-xl border border-[#7366fe]/45 px-3 py-2 text-xs font-medium tracking-[0.12em] text-[#7366fe]">
                AANPASSEN
              </button>
              <button className="rounded-xl border border-[#c4c3c1]/70 px-3 py-2 text-xs font-medium tracking-[0.12em] text-[#333333]">
                ANNULEREN
              </button>
            </div>
          </div>
        </DetailMock>
      </div>
    </section>
  );
}

function MobileStorySection() {
  return (
    <section className="bg-white/55 py-20 md:py-24">
      <div className="mx-auto grid w-full max-w-[1200px] gap-12 px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="relative min-h-[520px]">
          <div className="absolute left-0 top-10 w-52 -rotate-6 md:left-8">
            <PhoneMock mode="chat" />
          </div>
          <div className="absolute left-1/2 top-0 z-10 w-56 -translate-x-1/2">
            <PhoneMock mode="book" />
          </div>
          <div className="absolute right-0 top-16 w-52 rotate-6 md:right-12">
            <PhoneMock mode="done" />
          </div>
          <p className="absolute bottom-4 left-6 flex items-center gap-3 text-sm font-medium tracking-[0.167em]">
            <ArrowRightIcon className="size-5 text-[#7366fe]" />
            DEEL DE LINK, DE REST WIJST ZICH VANZELF
          </p>
        </div>

        <div>
          <Eyebrow align="left">MOBIEL EERST</Eyebrow>
          <h2 className="mt-5 text-4xl font-bold leading-none tracking-normal md:text-[56px]">
            Van groepsapp naar <Highlight>afspraak</Highlight>
          </h2>
          <div className="mt-8 text-6xl font-bold leading-none text-[#7366fe]">
            &ldquo;
          </div>
          <p className="mt-2 max-w-lg text-base font-light leading-8 tracking-[0.12em]">
            Eerst stonden afspraken verspreid over losse berichten. Nu ziet de
            groep direct waar nog plek is, zonder dat iemand een nieuw account
            hoeft te maken.
          </p>
          <div className="mt-7 flex items-center gap-4">
            <AvatarStack count={5} />
            <p className="text-sm font-medium tracking-[0.12em]">
              Familiecoordinator
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-col items-center px-6 pb-10 pt-20 text-center md:pt-24">
      <Eyebrow>EEN LINK. GEEN ACCOUNT.</Eyebrow>
      <h2 className="mt-5 max-w-3xl text-4xl font-bold leading-none tracking-normal md:text-[56px]">
        Maak vandaag een <Highlight>rustig</Highlight> rooster
      </h2>
      <p className="mt-6 max-w-2xl text-sm font-light leading-7 tracking-[0.14em] md:text-base md:tracking-[0.167em]">
        Plan samen bezoek zonder heen-en-weer berichten. Je ontvangt een
        bezoekerslink en een beheerlink voor jezelf.
      </p>

      <CreateRosterForm
        formId="footer-roster-title"
        buttonText="Maak het rooster"
        className="relative z-10 mt-10 w-full max-w-2xl"
      />

      <footer className="mt-20 flex w-full flex-col gap-6 border-t border-[#c4c3c1]/45 pt-8 text-left md:flex-row md:items-center md:justify-between">
        <a href="#top" className="flex items-center gap-3">
          <CalendarDaysIcon className="size-8 text-[#333333]" />
          <div>
            <p className="text-2xl font-bold tracking-normal">Bezoekje</p>
            <p className="text-xs font-medium tracking-[0.167em] text-[#8b8c96]">
              SAMEN BEZOEK PLANNEN
            </p>
          </div>
        </a>
        <div className="flex flex-wrap gap-5 text-xs font-medium tracking-[0.167em] text-[#333333]">
          <a href="#details" className="hover:text-[#7366fe]">
            HOE WERKT HET
          </a>
          <a href="#product" className="hover:text-[#7366fe]">
            VOORBEELD
          </a>
          <span className="text-[#8b8c96]">NOINDEX VOOR PRIVACY</span>
        </div>
      </footer>
    </section>
  );
}

function CreateRosterForm({
  formId,
  buttonText = "Maak een rooster",
  className,
}: {
  formId: string;
  buttonText?: string;
  className?: string;
}) {
  return (
    <form
      action={createRosterAction}
      className={`rounded-[32px] bg-white p-5 text-left shadow-[11px_11px_40px_rgba(0,0,0,0.10)] md:p-7 ${className ?? ""}`}
    >
      <Label
        htmlFor={formId}
        className="text-xs font-medium uppercase tracking-[0.167em] text-[#333333]"
      >
        Naam van het rooster
      </Label>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <Input
          id={formId}
          name="title"
          required
          maxLength={80}
          placeholder="Bijv. Bezoek voor mama"
          className="h-13 rounded-xl border-[#c4c3c1]/75 bg-white px-4 text-base tracking-[0.08em] text-[#333333] placeholder:text-[#8b8c96] focus-visible:border-[#7366fe] focus-visible:ring-[#7366fe]/25"
        />
        <Button
          type="submit"
          size="lg"
          className="h-13 rounded-xl bg-[#7366fe] px-6 text-sm font-medium tracking-[0.12em] text-white shadow-none hover:bg-[#6154ee]"
        >
          {buttonText}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
      <p className="mt-4 flex items-start gap-2 text-xs leading-5 tracking-[0.12em] text-[#8b8c96]">
        <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-[#7366fe]" />
        Je krijgt twee links: een om te delen en een beheerlink voor jezelf.
      </p>
    </form>
  );
}

function RosterMock({ compact = false }: { compact?: boolean }) {
  return (
    <div className="overflow-hidden rounded-[32px] bg-white text-left shadow-[11px_11px_40px_rgba(0,0,0,0.10)]">
      <div className="flex items-center justify-between border-b border-[#f5f3f2] px-5 py-4 md:px-7">
        <div className="flex items-center gap-2">
          <HeartHandshakeIcon className="size-5 text-[#7366fe]" />
          <span className="font-bold tracking-normal">Bezoekje</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden rounded-lg border border-[#c4c3c1]/60 px-3 py-1.5 text-xs font-medium tracking-[0.12em] text-[#333333] md:block">
            DELEN
          </button>
          <AvatarStack count={4} />
        </div>
      </div>

      <div
        className={`grid ${compact ? "lg:grid-cols-[0.85fr_1.05fr_1.1fr]" : "lg:grid-cols-[0.9fr_1.1fr_1.1fr]"}`}
      >
        <div className="border-b border-[#f5f3f2] p-5 lg:border-b-0 lg:border-r md:p-7">
          <p className="text-xs font-medium uppercase tracking-[0.167em] text-[#8b8c96]">
            Rooster
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-normal">
            Bij opa en oma
          </h3>

          <div className="mt-6 rounded-3xl bg-[#d5d1f4]/60 p-4">
            <div className="flex gap-3">
              <PinIcon className="mt-0.5 size-4 shrink-0 text-[#7366fe]" />
              <div>
                <p className="text-sm font-bold tracking-normal">
                  Even opletten
                </p>
                <p className="mt-1 text-xs leading-5 tracking-[0.1em]">
                  Korte bezoekjes zijn vandaag het fijnst.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm tracking-[0.1em]">
            <div className="flex gap-3">
              <ClockIcon className="size-4 text-[#8b8c96]" />
              <span>Bezoek kan van 10:00 tot 20:00</span>
            </div>
            <div className="flex gap-3">
              <UsersRoundIcon className="size-4 text-[#8b8c96]" />
              <span>Vandaag komen Anneke en Tom</span>
            </div>
          </div>

          <button className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-[#7366fe]/60 px-4 py-3 text-sm font-medium tracking-[0.12em] text-[#7366fe]">
            <MessageCircleIcon className="size-4" />
            Deel het rooster
          </button>
        </div>

        <div className="border-b border-[#f5f3f2] p-5 lg:border-b-0 lg:border-r md:p-7">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold tracking-normal">Mei 2026</h3>
            <button className="rounded-lg bg-[#f5f3f2] px-3 py-1.5 text-xs font-medium tracking-[0.12em]">
              VANDAAG
            </button>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-1 text-center text-xs font-medium tracking-[0.12em] text-[#8b8c96]">
            {["MA", "DI", "WO", "DO", "VR", "ZA", "ZO"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1">
            {calendarCells.map((day, index) => {
              const selected = index === 15;
              const booked = bookedIndexes.has(index);
              const muted = mutedIndexes.has(index);

              return (
                <div
                  key={`${day}-${index}`}
                  className={`relative flex aspect-square items-center justify-center rounded-xl text-sm ${
                    selected
                      ? "bg-[#7366fe] font-bold text-white"
                      : muted
                        ? "text-[#c4c3c1]"
                        : "text-[#333333]"
                  }`}
                >
                  {day}
                  {booked && !selected ? (
                    <span className="absolute bottom-1.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-[#7366fe]" />
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-xs tracking-[0.1em] text-[#8b8c96]">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#7366fe]" />
              Bezoek gepland
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#c4c3c1]" />
              Nog ruimte
            </span>
          </div>
        </div>

        <div className="p-5 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold tracking-normal">
                Donderdag 14 mei
              </h3>
              <p className="mt-1 text-xs tracking-[0.12em] text-[#8b8c96]">
                3 BEZOEKEN
              </p>
            </div>
            <button className="rounded-lg border border-[#c4c3c1]/60 px-3 py-1.5 text-xs font-medium tracking-[0.1em]">
              BLOKKEER
            </button>
          </div>

          <div className="mt-5 space-y-3">
            <VisitCard name="Anneke" time="10:00 - 11:00" />
            <FreeSlot time="11:00 - 12:00" />
            <BlockedSlot time="12:00 - 14:00" />
            <VisitCard name="Tom en Els" time="15:00 - 16:00" />
            <FreeSlot time="17:00 - 18:00" />
          </div>
        </div>
      </div>
    </div>
  );
}

function VisitCard({ name, time }: { name: string; time: string }) {
  return (
    <div className="rounded-2xl bg-[radial-gradient(circle_farthest-side_at_50%_100%,rgb(53,28,175),rgba(115,102,254,0)_82%),linear-gradient(135deg,#7366fe,#2b2042)] p-4 text-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.12em] text-white/80">{time}</p>
          <p className="mt-1 text-sm font-bold tracking-normal">{name}</p>
        </div>
        <AvatarStack count={3} small />
      </div>
    </div>
  );
}

function FreeSlot({ time }: { time: string }) {
  return (
    <button className="flex w-full items-center justify-between rounded-2xl border border-[#7366fe]/45 bg-white px-4 py-3 text-left text-sm tracking-[0.08em] text-[#333333]">
      <span>{time}</span>
      <span className="flex items-center gap-2 font-medium text-[#7366fe]">
        nog vrij
        <PlusIcon className="size-4" />
      </span>
    </button>
  );
}

function BlockedSlot({ time }: { time: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#f5f3f2] px-4 py-3 text-sm tracking-[0.08em] text-[#8b8c96]">
      <span>{time}</span>
      <span>rust</span>
    </div>
  );
}

function FlowCard({
  step,
}: {
  step: (typeof flowSteps)[number];
}) {
  const Icon = step.icon;

  return (
    <article className="rounded-[32px] bg-white p-6 shadow-[11px_11px_40px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-[#d5d1f4] text-sm font-bold text-[#7366fe]">
        {step.number}
      </div>
      <div className="mt-7 flex justify-center">
        <Icon className="size-7 text-[#7366fe]" />
      </div>
      <h3 className="mt-5 text-center text-2xl font-bold tracking-normal">
        {step.title}
      </h3>
      <p className="mt-2 text-center text-xs font-medium uppercase tracking-[0.167em] text-[#7366fe]">
        {step.label}
      </p>
      <p className="mt-5 text-center text-sm leading-6 tracking-[0.1em] text-[#333333]">
        {step.copy}
      </p>
      <div className="mt-7 rounded-2xl border border-[#c4c3c1]/45 px-3 py-3">
        <p className="truncate text-xs tracking-[0.08em] text-[#8b8c96]">
          bezoekje.app/{step.number === "3" ? "admin" : step.number === "2" ? "v" : "r"}/abc123
        </p>
      </div>
    </article>
  );
}

function DetailMock({
  icon: Icon,
  title,
  copy,
  children,
}: {
  icon: typeof MessageCircleIcon;
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-[32px] bg-white p-6 shadow-[11px_11px_40px_rgba(0,0,0,0.06)]">
      <div className="flex items-start gap-4">
        <Icon className="size-7 shrink-0 text-[#7366fe]" />
        <div>
          <h3 className="text-xl font-bold tracking-normal">{title}</h3>
          <p className="mt-2 text-sm leading-6 tracking-[0.1em] text-[#333333]">
            {copy}
          </p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </article>
  );
}

function SlotList() {
  return (
    <div className="space-y-2">
      {[
        ["10:00 - 11:00", "bezet"],
        ["11:00 - 12:00", "nog vrij"],
        ["13:00 - 14:00", "nog vrij"],
      ].map(([time, state]) => (
        <div
          key={time}
          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm tracking-[0.08em] ${
            state === "nog vrij"
              ? "border-[#7366fe]/45 bg-[#d5d1f4]/30 text-[#7366fe]"
              : "border-[#c4c3c1]/45 bg-[#f5f3f2] text-[#8b8c96]"
          }`}
        >
          <span>{time}</span>
          <span>{state}</span>
        </div>
      ))}
    </div>
  );
}

function PhoneMock({ mode }: { mode: "chat" | "book" | "done" | "edit" }) {
  return (
    <div className="rounded-[32px] border border-[#333333]/20 bg-[#333333] p-2 shadow-[11px_11px_40px_rgba(0,0,0,0.14)]">
      <div className="overflow-hidden rounded-[26px] bg-white">
        <div className="flex items-center justify-between border-b border-[#f5f3f2] px-4 py-3 text-xs font-medium tracking-[0.08em]">
          <span>10:31</span>
          <span className="h-4 w-16 rounded-full bg-[#333333]" />
          <span>5G</span>
        </div>
        <div className="min-h-[360px] p-5">
          {mode === "chat" ? <ChatScreen /> : null}
          {mode === "book" ? <BookScreen /> : null}
          {mode === "done" ? <DoneScreen /> : null}
          {mode === "edit" ? <EditScreen /> : null}
        </div>
      </div>
    </div>
  );
}

function ChatScreen() {
  return (
    <div className="space-y-4">
      <p className="text-sm font-bold tracking-normal">Familie app</p>
      <div className="rounded-3xl bg-[#f5f3f2] p-4 text-sm leading-6 tracking-[0.08em]">
        Kun je ook langs? Kies zelf een moment in het rooster.
      </div>
      <div className="ml-6 rounded-3xl bg-[#d5d1f4]/70 p-4 text-sm leading-6 tracking-[0.08em]">
        Bezoekrooster
        <br />
        <span className="text-[#7366fe]">bezoekje.app/r/abc123</span>
      </div>
    </div>
  );
}

function BookScreen() {
  return (
    <div>
      <p className="text-center text-sm font-bold tracking-normal">
        Kies een moment
      </p>
      <div className="mt-5 grid grid-cols-5 gap-2 text-center text-xs tracking-[0.08em]">
        {["MA", "DI", "WO", "DO", "VR"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-5 space-y-2">
        {["10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "15:00 - 16:00"].map(
          (time, index) => (
            <div
              key={time}
              className={`rounded-2xl border px-4 py-3 text-sm tracking-[0.08em] ${
                index === 2
                  ? "border-[#7366fe] bg-[#d5d1f4]/45 text-[#7366fe]"
                  : "border-[#c4c3c1]/50"
              }`}
            >
              {time}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function DoneScreen() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-[#d5d1f4]">
        <CheckIcon className="size-8 text-[#7366fe]" />
      </div>
      <p className="mt-6 text-xl font-bold leading-tight tracking-normal">
        Je bezoek staat vast
      </p>
      <p className="mt-3 rounded-full bg-[#d5d1f4]/70 px-4 py-2 text-sm font-medium tracking-[0.08em] text-[#7366fe]">
        12:00 - 13:00
      </p>
      <button className="mt-8 w-full rounded-xl bg-[#7366fe] px-4 py-3 text-sm font-medium tracking-[0.12em] text-white">
        Klaar
      </button>
    </div>
  );
}

function EditScreen() {
  return (
    <div>
      <p className="text-sm font-bold tracking-normal">Bewerk bezoek</p>
      <div className="mt-5 rounded-3xl bg-[radial-gradient(circle_farthest-side_at_50%_100%,rgb(53,28,175),rgba(115,102,254,0)_82%),linear-gradient(135deg,#7366fe,#2b2042)] p-5 text-white">
        <p className="text-sm font-bold tracking-normal">Julia</p>
        <p className="mt-2 text-xs tracking-[0.1em] text-white/75">
          Vandaag, 13:00 - 14:00
        </p>
      </div>
      <div className="mt-5 space-y-3">
        <div className="rounded-2xl border border-[#c4c3c1]/50 px-4 py-3 text-sm tracking-[0.08em]">
          Naam
        </div>
        <div className="rounded-2xl border border-[#c4c3c1]/50 px-4 py-3 text-sm tracking-[0.08em]">
          Tijd
        </div>
      </div>
      <button className="mt-5 w-full rounded-xl bg-[#7366fe] px-4 py-3 text-sm font-medium tracking-[0.12em] text-white">
        Opslaan
      </button>
    </div>
  );
}

function AvatarStack({
  count = 3,
  small = false,
}: {
  count?: number;
  small?: boolean;
}) {
  return (
    <div className="flex -space-x-2">
      {["A", "T", "M", "J", "E"].slice(0, count).map((initial, index) => (
        <span
          key={`${initial}-${index}`}
          className={`${small ? "size-6 text-[10px]" : "size-8 text-xs"} flex items-center justify-center rounded-full border-2 border-white bg-[#d5d1f4] font-bold text-[#7366fe]`}
        >
          {initial}
        </span>
      ))}
    </div>
  );
}

function Eyebrow({
  children,
  align = "center",
}: {
  children: string;
  align?: "center" | "left";
}) {
  return (
    <p
      className={`text-xs font-medium uppercase tracking-[0.167em] text-[#7366fe] ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      {children}
    </p>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-lg bg-[#d5d1f4] px-2 leading-[1.05]">
      {children}
    </span>
  );
}
