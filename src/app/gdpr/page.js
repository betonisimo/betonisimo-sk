export const metadata = {
  title: "Ochrana osobných údajov (GDPR)",
};

export default function GDPRPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-10 mt-10 text-2xl font-bold md:text-4xl">
        ZÁSADY OCHRANY OSOBNÝCH ÚDAJOV (GDPR)
      </h1>

      <p className="mb-8">
        Informácie o ochrane osobných údajov vypracované v súlade s
        nariadením Európskeho parlamentu a Rady (EÚ) 2016/679 o ochrane
        fyzických osôb pri spracúvaní osobných údajov a o voľnom pohybe
        takýchto údajov (ďalej len „GDPR“) a zákonom č. 18/2018 Z. z.
        o ochrane osobných údajov (ďalej len „Zákon o ochrane osobných údajov“).
      </p>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">1. Prevádzkovateľ</h2>

        <p>Prevádzkovateľom osobných údajov je:</p>

        <div className="mt-4 space-y-1">
          <p>Serhii Belia</p>
          <p>
            Adresa miesta činnosti podniku zahraničnej osoby: Abrahám 227,
            925 45 Abrahám, Slovenská republika
          </p>
          <p>IČO: 50918753</p>
          <p>DIČ: 3120539851</p>
          <p>
            Vedený v registri Okresný úrad Galanta, číslo živnostenského
            registra 340-40036
          </p>
          <p>
            Označenie: podnik zahraničnej osoby. Vedúci podniku zahraničnej
            osoby Serhii Belia 90005 Mižhirja, Zaperedilja 260a
          </p>
          <p>E-mail: betonisimo.sk@gmail.com</p>
          <p>Telefón: +421 952 515 556</p>
        </div>

        <p className="mt-4">(ďalej len „Prevádzkovateľ“)</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">
          2. Aké osobné údaje spracúvame
        </h2>

        <p>
          Prostredníctvom kontaktného formulára alebo e-mailovej komunikácie
          môžeme spracúvať:
        </p>

        <ul className="mt-4 list-disc pl-6 space-y-2">
          <li>meno a priezvisko,</li>
          <li>telefónne číslo,</li>
          <li>e-mailovú adresu,</li>
          <li>adresu realizácie zákazky,</li>
          <li>obsah správy alebo dopytu,</li>
          <li>technické údaje získané pri návšteve webovej stránky.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">
          3. Účel spracovania osobných údajov
        </h2>

        <p>Osobné údaje spracúvame za účelom:</p>

        <ul className="mt-4 list-disc pl-6 space-y-2">
          <li>vybavenia dopytu zákazníka a vypracovania cenovej ponuky,</li>
          <li>komunikácie so zákazníkom,</li>
          <li>uzatvorenia a plnenia zmluvy,</li>
          <li>vedenia účtovnej a daňovej evidencie,</li>
          <li>ochrany oprávnených záujmov prevádzkovateľa.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">
          4. Právny základ spracovania
        </h2>

        <p>Právnym základom spracovania osobných údajov je:</p>

        <ul className="mt-4 list-disc pl-6 space-y-2">
          <li>
            čl. 6 ods. 1 písm. b) GDPR – plnenie zmluvy alebo vykonanie
            opatrení pred uzatvorením zmluvy,
          </li>
          <li>
            čl. 6 ods. 1 písm. c) GDPR – splnenie zákonných povinností,
          </li>
          <li>
            čl. 6 ods. 1 písm. f) GDPR – oprávnený záujem prevádzkovateľa.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">
          5. Doba uchovávania údajov
        </h2>

        <p>Osobné údaje uchovávame:</p>

        <ul className="mt-4 list-disc pl-6 space-y-2">
          <li>počas trvania komunikácie so zákazníkom,</li>
          <li>po dobu potrebnú na vypracovanie a evidenciu cenovej ponuky,</li>
          <li>
            počas zákonom stanovenej doby pri účtovných a daňových dokladoch,
          </li>
          <li>
            najdlhšie po dobu nevyhnutnú na ochranu právnych nárokov
            prevádzkovateľa.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">
          6. Príjemcovia osobných údajov
        </h2>

        <p>Osobné údaje môžu byť sprístupnené:</p>

        <ul className="mt-4 list-disc pl-6 space-y-2">
          <li>účtovníkovi alebo účtovnej spoločnosti,</li>
          <li>poskytovateľovi webhostingu,</li>
          <li>poskytovateľom IT služieb,</li>
          <li>prepravnej spoločnosti,</li>
          <li>orgánom verejnej moci, ak to vyžaduje zákon.</li>
        </ul>

        <p className="mt-4">
          Prevádzkovateľ osobné údaje nepredáva tretím stranám.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">
          7. Práva dotknutej osoby
        </h2>

        <p>Máte právo:</p>

        <ul className="mt-4 list-disc pl-6 space-y-2">
          <li>na prístup k osobným údajom,</li>
          <li>na opravu nesprávnych údajov,</li>
          <li>na vymazanie osobných údajov,</li>
          <li>na obmedzenie spracúvania,</li>
          <li>namietať proti spracúvaniu,</li>
          <li>na prenosnosť údajov,</li>
          <li>podať sťažnosť na Úrad na ochranu osobných údajov SR.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">8. Kontakt</h2>

        <p>
          V prípade otázok týkajúcich sa ochrany osobných údajov nás môžete
          kontaktovať:
        </p>

        <div className="mt-4 space-y-1">
          <p>E-mail: betonisimo.sk@gmail.com</p>
          <p>Telefón: +421 952 515 556</p>
        </div>
      </section>
    </main>
  );
}