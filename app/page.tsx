import { createRosterAction } from "@/app/actions";
import { Reveal } from "@/components/landing/reveal";

const flowSteps = [
  {
    icon: LinkIcon,
    number: "01",
    title: "Delen",
    label: "Voor iedereen",
    labelClass: "bg-[#E1F3FE] text-[#1F6C9F]",
    copy: "Zet de bezoekerslink in de groepsapp. Iedereen kan meekijken en een moment kiezen.",
    url: "bezoekje.app/r/x7Kq9mP2",
  },
  {
    icon: PencilIcon,
    number: "02",
    title: "Plannen",
    label: "Voor jezelf",
    labelClass: "bg-[#EDF3EC] text-[#346538]",
    copy: "Wie langskomt krijgt een eigen link om het bezoek later aan te passen of te annuleren.",
    url: "bezoekje.app/r/…/v/38/aJ3n",
  },
  {
    icon: KeyIcon,
    number: "03",
    title: "Beheren",
    label: "Voor familie",
    labelClass: "bg-[#FBF3DB] text-[#956400]",
    copy: "Met de beheerlink pin je een notitie, zet je rustmomenten vast en pas je elk bezoek aan.",
    url: "bezoekje.app/r/…/admin/rW8s",
  },
];

const detailItems = [
  {
    icon: ChatIcon,
    iconClass: "bg-[#E1F3FE] text-[#1F6C9F]",
    title: "Deel met een klik",
    copy: "Een WhatsApp-bericht met de juiste link staat meteen klaar.",
  },
  {
    icon: CalendarIcon,
    iconClass: "bg-[#EDF3EC] text-[#346538]",
    title: "Vrije dagen vallen op",
    copy: "Lege momenten zijn zichtbaar, zodat iemand ze makkelijk kan vullen.",
  },
  {
    icon: MoonIcon,
    iconClass: "bg-[#FBF3DB] text-[#956400]",
    title: "Rust blijft rust",
    copy: "Zet behandelingen, rust of bezoekvrije uren vast in het rooster.",
  },
  {
    icon: PencilIcon,
    iconClass: "bg-[#FDEBEC] text-[#9F2F2D]",
    title: "Altijd aanpasbaar",
    copy: "Bezoekers beheren hun eigen afspraak zonder account of wachtwoord.",
  },
];

const calendarCells = Array.from({ length: 35 }, (_, i) => {
  if (i < 2) return String(29 + i);
  if (i < 33) return String(i - 1);
  return String(i - 32);
});

const bookedIndexes = new Set([8, 11, 15, 18, 22, 25, 30]);
const gapIndexes = new Set([17, 20]);
const mutedIndexes = new Set([0, 1, 33, 34]);

export default function HomePage() {
  return (
    <main className="min-h-svh bg-[#F7F6F3] text-[#2F3437]">
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

function Wordmark({ large = false }: { large?: boolean }) {
  return (
    <span
      className={`font-serif tracking-[-0.01em] text-[#111111] ${large ? "text-3xl" : "text-2xl"}`}
    >
      Bezoekje<span className="text-[#346538]">.</span>
    </span>
  );
}

function NavBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#EAEAEA] bg-[#F7F6F3]/85 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <a href="#top">
          <Wordmark />
        </a>
        <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-[0.08em] text-[#787774]">
          <a href="#product" className="hidden transition-colors hover:text-[#111111] sm:block">
            Voorbeeld
          </a>
          <a href="#details" className="transition-colors hover:text-[#111111]">
            Hoe het werkt
          </a>
        </div>
      </nav>
    </header>
  );
}

function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(640px_circle_at_18%_8%,rgba(207,188,158,0.16),transparent_65%),radial-gradient(560px_circle_at_85%_30%,rgba(158,188,166,0.13),transparent_65%)]"
      />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-24 pt-20 text-center md:pt-28">
        <Reveal>
          <Eyebrow>Bezoekrooster voor familie</Eyebrow>
          <h1 className="mt-6 font-serif text-[44px] leading-[1.05] tracking-[-0.02em] text-[#111111] md:text-7xl">
            Niemand een hele
            <br />
            dag alleen.
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-base leading-[1.6] text-[#55534E] md:text-lg">
            Eén link in de groepsapp. Iedereen ziet welke dagen nog leeg zijn
            en prikt zelf een moment — zonder account of wachtwoord.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-10 w-full max-w-xl">
          <CreateRosterForm formId="hero-roster-title" />
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 font-mono text-xs uppercase tracking-[0.08em] text-[#787774]">
            <a
              href="#product"
              className="border-b border-[#C9C6C1] pb-0.5 transition-colors hover:border-[#111111] hover:text-[#111111]"
            >
              Bekijk het voorbeeld
            </a>
            <a
              href="#details"
              className="inline-flex items-center gap-2 transition-colors hover:text-[#111111]"
            >
              Hoe het werkt
              <ArrowRightIcon className="size-3.5" />
            </a>
          </div>
        </Reveal>

        <Reveal delay={280} className="mt-16 w-full max-w-none md:-mx-10">
          <RosterMock />
        </Reveal>
      </div>
    </section>
  );
}

function LinkFlowSection() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[0.8fr_1.4fr] lg:items-center md:py-32">
      <Reveal>
        <Eyebrow>Eén rooster, drie links</Eyebrow>
        <h2 className="mt-5 max-w-md font-serif text-4xl leading-[1.1] tracking-[-0.02em] text-[#111111] md:text-5xl">
          De link is de sleutel
        </h2>
        <p className="mt-6 max-w-md text-base leading-[1.6] text-[#55534E]">
          Bezoekje kent geen accounts. Wie een link heeft, kan precies dat ene:
          meekijken, het eigen bezoek aanpassen, of het rooster beheren.
        </p>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-3">
        {flowSteps.map((step, index) => (
          <Reveal key={step.title} delay={index * 80}>
            <FlowCard step={step} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ProductSection() {
  return (
    <section id="product" className="overflow-hidden border-y border-[#EAEAEA] bg-white py-24 md:py-32">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 text-center">
        <Reveal>
          <Eyebrow>Het rooster</Eyebrow>
          <h2 className="mt-5 max-w-3xl font-serif text-4xl leading-[1.1] tracking-[-0.02em] text-[#111111] md:text-5xl">
            Lege dagen springen eruit
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-[1.6] text-[#55534E]">
            Een gewone agenda toont wat al vaststaat. Bezoekje laat juist zien
            waar nog niemand komt, zodat iemand die dag kan vullen.
          </p>
        </Reveal>
        <div className="relative mt-16 w-full">
          <div className="absolute -left-2 top-16 hidden w-44 -rotate-3 lg:block">
            <PhoneMock mode="book" />
          </div>
          <div className="absolute -right-2 top-24 hidden w-44 rotate-3 lg:block">
            <PhoneMock mode="edit" />
          </div>
          <Reveal delay={120} className="relative z-10 mx-auto max-w-4xl">
            <RosterMock />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function DetailsSection() {
  return (
    <section
      id="details"
      className="mx-auto grid w-full max-w-6xl gap-14 px-6 py-24 lg:grid-cols-[0.9fr_1.25fr] lg:items-start md:py-32"
    >
      <Reveal>
        <Eyebrow>Voor elk bezoek</Eyebrow>
        <h2 className="mt-5 font-serif text-4xl leading-[1.1] tracking-[-0.02em] text-[#111111] md:text-5xl">
          Klein genoeg voor iedereen
        </h2>
        <p className="mt-6 max-w-lg text-base leading-[1.6] text-[#55534E]">
          Geen app om te installeren, geen menu&apos;s om te leren. Alles wat
          een familielid van tachtig nodig heeft zit erin — de rest is
          weggelaten.
        </p>
        <div className="mt-10 grid gap-7">
          {detailItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-4">
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-md ${item.iconClass}`}
                >
                  <Icon className="size-4.5" />
                </span>
                <div>
                  <h3 className="text-base font-medium text-[#111111]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-[1.6] text-[#55534E]">{item.copy}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2">
        <Reveal delay={0}>
          <DetailMock title="Deel in WhatsApp" copy="Kom je ook langs? Kies een tijd in ons bezoekrooster.">
            <div className="rounded-lg bg-[#F7F6F3] p-4">
              <div className="rounded-md border border-[#EAEAEA] bg-white p-3.5">
                <p className="text-sm font-medium text-[#111111]">Bezoekrooster</p>
                <p className="mt-1.5 break-all font-mono text-xs text-[#1F6C9F]">
                  bezoekje.app/r/x7Kq9mP2
                </p>
              </div>
            </div>
          </DetailMock>
        </Reveal>
        <Reveal delay={80}>
          <DetailMock title="Vrij is duidelijk" copy="Beschikbare momenten zijn direct herkenbaar.">
            <SlotList />
          </DetailMock>
        </Reveal>
        <Reveal delay={160}>
          <DetailMock title="Rust blijft rust" copy="Blokkeer uren waar niemand hoeft te plannen.">
            <div className="flex items-center justify-between rounded-lg bg-[#FBF3DB] p-4">
              <div>
                <p className="font-mono text-sm text-[#956400]">14:00 – 16:00</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[#956400]/80">
                  Rustmoment
                </p>
              </div>
              <MoonIcon className="size-5 text-[#956400]" />
            </div>
          </DetailMock>
        </Reveal>
        <Reveal delay={240}>
          <DetailMock title="Zelf wijzigen" copy="Een persoonlijke link maakt aanpassen simpel.">
            <div className="rounded-lg border border-[#EAEAEA] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#111111]">Maaike</p>
                  <p className="mt-0.5 font-mono text-xs text-[#787774]">vandaag, 15:00</p>
                </div>
                <Tag className="bg-[#E1F3FE] text-[#1F6C9F]">Jij</Tag>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="rounded-md border border-[#111111] px-3 py-2 text-xs font-medium text-[#111111] transition active:scale-[0.98]">
                  Aanpassen
                </button>
                <button className="rounded-md border border-[#EAEAEA] px-3 py-2 text-xs font-medium text-[#787774] transition active:scale-[0.98]">
                  Annuleren
                </button>
              </div>
            </div>
          </DetailMock>
        </Reveal>
      </div>
    </section>
  );
}

function MobileStorySection() {
  return (
    <section className="border-y border-[#EAEAEA] bg-white py-24 md:py-32">
      <div className="mx-auto grid w-full max-w-6xl gap-14 px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <Reveal className="relative min-h-[500px]">
          <div className="absolute left-0 top-10 w-48 -rotate-3 md:left-8">
            <PhoneMock mode="chat" />
          </div>
          <div className="absolute left-1/2 top-0 z-10 w-52 -translate-x-1/2">
            <PhoneMock mode="book" />
          </div>
          <div className="absolute right-0 top-16 w-48 rotate-3 md:right-12">
            <PhoneMock mode="done" />
          </div>
          <p className="absolute bottom-0 left-0 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.08em] text-[#787774]">
            <ArrowRightIcon className="size-4" />
            Deel de link, de rest wijst zich vanzelf
          </p>
        </Reveal>

        <Reveal delay={120}>
          <Eyebrow>Mobiel eerst</Eyebrow>
          <h2 className="mt-5 font-serif text-4xl leading-[1.1] tracking-[-0.02em] text-[#111111] md:text-5xl">
            Van groepsapp naar afspraak
          </h2>
          <blockquote className="mt-9 border-l border-[#111111] pl-6">
            <p className="font-serif text-2xl leading-[1.4] text-[#2F3437] md:text-[27px]">
              &bdquo;Eerst stond alles verspreid over losse berichten — wie
              gaat er dinsdag? Nu ziet iedereen gewoon waar nog plek is.&rdquo;
            </p>
            <footer className="mt-6 flex items-center gap-4">
              <AvatarStack count={4} />
              <p className="font-mono text-xs uppercase tracking-[0.08em] text-[#787774]">
                Familiecoördinator
              </p>
            </footer>
          </blockquote>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-12 pt-24 text-center md:pt-32">
      <Reveal>
        <Eyebrow>Eén link, geen account</Eyebrow>
        <h2 className="mt-5 max-w-2xl font-serif text-4xl leading-[1.1] tracking-[-0.02em] text-[#111111] md:text-5xl">
          Begin met een naam
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-[1.6] text-[#55534E]">
          Meer is het niet: je typt een naam en het rooster bestaat. De link
          om te delen staat meteen klaar.
        </p>
      </Reveal>

      <Reveal delay={120} className="mt-10 w-full max-w-xl">
        <CreateRosterForm formId="footer-roster-title" buttonText="Maak het rooster" />
      </Reveal>

      <footer className="mt-24 flex w-full flex-col gap-6 border-t border-[#EAEAEA] pt-10 text-left md:flex-row md:items-end md:justify-between">
        <a href="#top">
          <Wordmark large />
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[#787774]">
            Samen bezoek plannen
          </p>
        </a>
        <div className="flex flex-wrap gap-6 font-mono text-[11px] uppercase tracking-[0.08em] text-[#787774]">
          <a href="#details" className="transition-colors hover:text-[#111111]">
            Hoe het werkt
          </a>
          <a href="#product" className="transition-colors hover:text-[#111111]">
            Voorbeeld
          </a>
          <span>Privé — niet geïndexeerd</span>
        </div>
      </footer>
    </section>
  );
}

function CreateRosterForm({
  formId,
  buttonText = "Maak een rooster",
}: {
  formId: string;
  buttonText?: string;
}) {
  return (
    <form
      action={createRosterAction}
      className="rounded-xl border border-[#EAEAEA] bg-white p-5 text-left shadow-[0_2px_16px_rgba(0,0,0,0.04)] md:p-6"
    >
      <label
        htmlFor={formId}
        className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#787774]"
      >
        Naam van het rooster
      </label>
      <div className="mt-3 grid gap-2.5 md:grid-cols-[1fr_auto]">
        <input
          id={formId}
          name="title"
          required
          maxLength={80}
          placeholder="Bijv. Bezoek voor mama"
          className="h-12 w-full rounded-md border border-[#EAEAEA] bg-[#FBFBFA] px-4 text-base text-[#2F3437] outline-none transition-colors placeholder:text-[#A8A5A0] focus:border-[#111111]"
        />
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2.5 rounded-md bg-[#111111] px-6 text-sm font-medium text-white transition hover:bg-[#333333] active:scale-[0.98]"
        >
          {buttonText}
          <ArrowRightIcon className="size-4" />
        </button>
      </div>
      <p className="mt-3.5 flex items-start gap-2 text-xs leading-[1.6] text-[#787774]">
        <ShieldIcon className="mt-0.5 size-3.5 shrink-0" />
        Je krijgt twee links: een om te delen en een beheerlink voor jezelf.
      </p>
    </form>
  );
}

function RosterMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#EAEAEA] bg-white text-left shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
      <div className="grid h-11 grid-cols-[1fr_auto_1fr] items-center border-b border-[#EAEAEA] px-4">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#E3E1DD]" />
          <span className="size-2.5 rounded-full bg-[#E3E1DD]" />
          <span className="size-2.5 rounded-full bg-[#E3E1DD]" />
        </div>
        <p className="font-mono text-xs text-[#787774]">bezoekje.app/r/x7Kq9mP2</p>
        <span />
      </div>

      <div className="grid lg:grid-cols-[0.9fr_1.1fr_1.1fr]">
        <div className="border-b border-[#EAEAEA] p-6 lg:border-b-0 lg:border-r">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#787774]">
            Rooster
          </p>
          <h3 className="mt-1.5 font-serif text-[26px] tracking-[-0.01em] text-[#111111]">
            Bij opa en oma
          </h3>

          <div className="mt-6 rounded-lg bg-[#FBF3DB] p-4">
            <div className="flex gap-3">
              <PinIcon className="mt-0.5 size-4 shrink-0 text-[#956400]" />
              <div>
                <p className="text-sm font-medium text-[#956400]">Even opletten</p>
                <p className="mt-1 text-xs leading-[1.6] text-[#956400]/90">
                  Korte bezoekjes zijn vandaag het fijnst.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3.5 text-sm text-[#55534E]">
            <div className="flex items-center gap-3">
              <ClockIcon className="size-4 shrink-0 text-[#787774]" />
              <span>Bezoek kan van 10:00 tot 20:00</span>
            </div>
            <div className="flex items-center gap-3">
              <UsersIcon className="size-4 shrink-0 text-[#787774]" />
              <span>Vandaag komen Anneke en Tom</span>
            </div>
          </div>

          <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-md border border-[#EAEAEA] bg-white px-4 py-2.5 text-sm font-medium text-[#111111] transition hover:border-[#C9C6C1] active:scale-[0.98]">
            <ChatIcon className="size-4" />
            Deel het rooster
          </button>
        </div>

        <div className="border-b border-[#EAEAEA] p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-[#111111]">Mei 2026</h3>
            <button className="rounded-md border border-[#EAEAEA] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[#787774]">
              Vandaag
            </button>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-1 text-center font-mono text-[10px] uppercase tracking-[0.08em] text-[#A8A5A0]">
            {["ma", "di", "wo", "do", "vr", "za", "zo"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {calendarCells.map((day, index) => {
              const selected = index === 15;
              const booked = bookedIndexes.has(index);
              const gap = gapIndexes.has(index);
              const muted = mutedIndexes.has(index);

              return (
                <div
                  key={`${day}-${index}`}
                  className={`relative flex aspect-square items-center justify-center rounded-md text-sm ${
                    selected
                      ? "bg-[#111111] font-medium text-white"
                      : gap
                        ? "bg-[#EDF3EC] text-[#346538]"
                        : muted
                          ? "text-[#C9C6C1]"
                          : "text-[#2F3437]"
                  }`}
                >
                  {day}
                  {booked && !selected ? (
                    <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-[#2F3437]" />
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#787774]">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#2F3437]" />
              Bezoek gepland
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-[3px] bg-[#EDF3EC]" />
              Nog niemand
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg text-[#111111]">Donderdag 14 mei</h3>
              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[#787774]">
                3 bezoeken
              </p>
            </div>
            <button className="rounded-md border border-[#EAEAEA] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[#787774]">
              Blokkeer
            </button>
          </div>

          <div className="mt-5 space-y-2">
            <VisitRow name="Anneke" time="10:00 – 11:00" />
            <FreeSlot time="11:00 – 12:00" />
            <BlockedSlot time="12:00 – 14:00" />
            <VisitRow name="Tom en Els" time="15:00 – 16:00" />
            <FreeSlot time="17:00 – 18:00" />
          </div>
        </div>
      </div>
    </div>
  );
}

function VisitRow({ name, time }: { name: string; time: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[#EAEAEA] bg-white px-4 py-3">
      <div>
        <p className="font-mono text-xs text-[#787774]">{time}</p>
        <p className="mt-0.5 text-sm font-medium text-[#111111]">{name}</p>
      </div>
      <AvatarStack count={2} small />
    </div>
  );
}

function FreeSlot({ time }: { time: string }) {
  return (
    <button className="flex w-full items-center justify-between rounded-lg bg-[#EDF3EC] px-4 py-3 text-left transition active:scale-[0.99]">
      <span className="font-mono text-xs text-[#346538]">{time}</span>
      <span className="flex items-center gap-1.5 text-sm font-medium text-[#346538]">
        nog vrij
        <PlusIcon className="size-3.5" />
      </span>
    </button>
  );
}

function BlockedSlot({ time }: { time: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[#FBF3DB] px-4 py-3">
      <span className="font-mono text-xs text-[#956400]">{time}</span>
      <span className="flex items-center gap-1.5 text-sm text-[#956400]">
        rust
        <MoonIcon className="size-3.5" />
      </span>
    </div>
  );
}

function FlowCard({ step }: { step: (typeof flowSteps)[number] }) {
  const Icon = step.icon;

  return (
    <article className="flex h-full flex-col rounded-xl border border-[#EAEAEA] bg-white p-7 transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-[#A8A5A0]">{step.number}</span>
        <Tag className={step.labelClass}>{step.label}</Tag>
      </div>
      <Icon className="mt-7 size-6 text-[#111111]" />
      <h3 className="mt-4 font-serif text-2xl tracking-[-0.01em] text-[#111111]">{step.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-[1.6] text-[#55534E]">{step.copy}</p>
      <div className="mt-6 rounded-md border border-[#EAEAEA] bg-[#F7F6F3] px-3 py-2.5">
        <p className="truncate font-mono text-xs text-[#787774]">{step.url}</p>
      </div>
    </article>
  );
}

function DetailMock({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-[#EAEAEA] bg-white p-6 transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h3 className="font-serif text-xl tracking-[-0.01em] text-[#111111]">{title}</h3>
      <p className="mt-1.5 text-sm leading-[1.6] text-[#55534E]">{copy}</p>
      <div className="mt-5 flex flex-1 flex-col justify-end">{children}</div>
    </article>
  );
}

function SlotList() {
  return (
    <div className="space-y-2">
      {[
        ["10:00 – 11:00", "bezet"],
        ["11:00 – 12:00", "nog vrij"],
        ["13:00 – 14:00", "nog vrij"],
      ].map(([time, state]) => (
        <div
          key={time}
          className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${
            state === "nog vrij" ? "bg-[#EDF3EC] text-[#346538]" : "bg-[#F7F6F3] text-[#A8A5A0]"
          }`}
        >
          <span className="font-mono text-xs">{time}</span>
          <span className="text-sm">{state}</span>
        </div>
      ))}
    </div>
  );
}

function PhoneMock({ mode }: { mode: "chat" | "book" | "done" | "edit" }) {
  return (
    <div className="rounded-[28px] bg-[#111111] p-1.5 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
      <div className="overflow-hidden rounded-[22px] bg-white">
        <div className="flex items-center justify-between border-b border-[#EAEAEA] px-4 py-2.5 font-mono text-[10px] text-[#787774]">
          <span>10:31</span>
          <span className="h-3.5 w-14 rounded-full bg-[#111111]" />
          <span>5G</span>
        </div>
        <div className="min-h-[340px] p-4">
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
    <div className="space-y-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#787774]">
        Familie-app
      </p>
      <div className="rounded-lg rounded-bl-sm bg-[#F7F6F3] p-3 text-[13px] leading-[1.5] text-[#2F3437]">
        Kun je ook langs? Kies zelf een moment in het rooster.
      </div>
      <div className="ml-6 rounded-lg rounded-br-sm bg-[#EDF3EC] p-3 text-[13px] leading-[1.5] text-[#2F3437]">
        Bezoekrooster
        <br />
        <span className="font-mono text-xs text-[#346538]">bezoekje.app/r/x7Kq9mP2</span>
      </div>
    </div>
  );
}

function BookScreen() {
  return (
    <div>
      <p className="text-center text-sm font-medium text-[#111111]">Kies een moment</p>
      <div className="mt-4 grid grid-cols-5 gap-1.5 text-center font-mono text-[10px] uppercase tracking-[0.08em] text-[#A8A5A0]">
        {["ma", "di", "wo", "do", "vr"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {["10:00 – 11:00", "11:00 – 12:00", "12:00 – 13:00", "15:00 – 16:00"].map(
          (time, index) => (
            <div
              key={time}
              className={`rounded-md px-3.5 py-2.5 font-mono text-xs ${
                index === 2
                  ? "bg-[#111111] text-white"
                  : "border border-[#EAEAEA] text-[#55534E]"
              }`}
            >
              {time}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function DoneScreen() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-[#EDF3EC]">
        <CheckIcon className="size-7 text-[#346538]" />
      </div>
      <p className="mt-5 font-serif text-xl leading-tight text-[#111111]">
        Je bezoek staat vast
      </p>
      <p className="mt-3 rounded-full bg-[#EDF3EC] px-3.5 py-1.5 font-mono text-xs text-[#346538]">
        12:00 – 13:00
      </p>
      <button className="mt-7 w-full rounded-md bg-[#111111] px-4 py-2.5 text-sm font-medium text-white">
        Klaar
      </button>
    </div>
  );
}

function EditScreen() {
  return (
    <div>
      <p className="text-sm font-medium text-[#111111]">Bewerk bezoek</p>
      <div className="mt-4 rounded-lg border border-[#EAEAEA] bg-[#F7F6F3] p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-[#111111]">Julia</p>
          <Tag className="bg-[#E1F3FE] text-[#1F6C9F]">Jij</Tag>
        </div>
        <p className="mt-1 font-mono text-xs text-[#787774]">vandaag, 13:00 – 14:00</p>
      </div>
      <div className="mt-4 space-y-2">
        <div className="rounded-md border border-[#EAEAEA] px-3.5 py-2.5 text-[13px] text-[#787774]">
          Naam
        </div>
        <div className="rounded-md border border-[#EAEAEA] px-3.5 py-2.5 text-[13px] text-[#787774]">
          Tijd
        </div>
      </div>
      <button className="mt-4 w-full rounded-md bg-[#111111] px-4 py-2.5 text-sm font-medium text-white">
        Opslaan
      </button>
    </div>
  );
}

const avatarStyles = [
  "bg-[#EDF3EC] text-[#346538]",
  "bg-[#E1F3FE] text-[#1F6C9F]",
  "bg-[#FBF3DB] text-[#956400]",
  "bg-[#FDEBEC] text-[#9F2F2D]",
  "bg-[#EDF3EC] text-[#346538]",
];

function AvatarStack({ count = 3, small = false }: { count?: number; small?: boolean }) {
  return (
    <div className="flex -space-x-1.5">
      {["A", "T", "M", "J", "E"].slice(0, count).map((initial, index) => (
        <span
          key={`${initial}-${index}`}
          className={`${small ? "size-6 text-[10px]" : "size-8 text-xs"} flex items-center justify-center rounded-full border-2 border-white font-medium ${avatarStyles[index]}`}
        >
          {initial}
        </span>
      ))}
    </div>
  );
}

function Tag({ children, className }: { children: string; className: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.05em] ${className}`}
    >
      {children}
    </span>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.08em] text-[#787774]">{children}</p>
  );
}

/* ---------------------------------------------------------------- icons */

type IconProps = { className?: string };

function Icon({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Icon>
  );
}

function LinkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Icon>
  );
}

function PencilIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M17 3a2.12 2.12 0 0 1 3 3L7.5 18.5 3 20l1.5-4.5Z" />
      <path d="m15 5 3 3" />
    </Icon>
  );
}

function KeyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="7.5" cy="15.5" r="4" />
      <path d="m10.3 12.7 8.2-8.2" />
      <path d="m15 8 3 3" />
    </Icon>
  );
}

function ChatIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5 8.38 8.38 0 0 1 8.5 8.5Z" />
    </Icon>
  );
}

function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </Icon>
  );
}

function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  );
}

function UsersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Icon>
  );
}

function PinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 17v5" />
      <path d="M9 3h6l1 7 2 2H6l2-2Z" />
    </Icon>
  );
}

function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  );
}

function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

function ShieldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  );
}

function MoonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </Icon>
  );
}
