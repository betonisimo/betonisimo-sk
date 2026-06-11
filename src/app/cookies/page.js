import React from 'react';

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800 font-sans leading-relaxed">
      {/* Главный заголовок */}
      <h1 className="mb-10 mt-10 text-2xl font-bold md:text-4xl">
        ZÁSADY POUŽÍVANIA COOKIES [cite: 57]
      </h1>

      {/* Что такое куки */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
          Čo sú cookies [cite: 58]
        </h2>
        <p className="mb-3">
          Cookies sú malé textové súbory ukladané vo vašom zariadení pri návšteve webovej stránky. [cite: 59]
        </p>
        <p>
          Slúžia na správne fungovanie stránky a zlepšovanie používateľského komfortu. [cite: 60]
        </p>
      </section>

      {/* Какие куки используем */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
          Aké cookies používame [cite: 61]
        </h2>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-medium mb-1 text-gray-900">
              Nevyhnutné cookies [cite: 62]
            </h3>
            <p className="text-gray-700">
              Tieto cookies sú potrebné pre správne fungovanie webovej stránky a nie je možné ich vypnúť. [cite: 63]
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-medium mb-1 text-gray-900">
              Analytické cookies [cite: 64]
            </h3>
            <p className="text-gray-700 mb-2">
              Pomáhajú nám získavať informácie o návštevnosti a používaní webovej stránky. [cite: 65]
            </p>
            <p className="text-sm text-gray-600 italic">
              Používajú sa len na základe vášho súhlasu. [cite: 66]
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-medium mb-1 text-gray-900">
              Marketingové cookies [cite: 67]
            </h3>
            <p className="text-gray-700 mb-2">
              Môžu byť používané službami tretích strán, ako napríklad: [cite: 68]
            </p>
            <ul className="list-disc pl-6 mb-2 text-gray-700">
              <li>Facebook (Meta) [cite: 69]</li>
              <li>Google Ads [cite: 70]</li>
              <li>Google Analytics [cite: 71]</li>
            </ul>
            <p className="text-sm text-gray-600 italic">
              Tieto cookies sa ukladajú len po udelení súhlasu (ak to na stránke používame). [cite: 72, 73]
            </p>
          </div>
        </div>
      </section>

      {/* Управление куки */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
          Správa cookies [cite: 74]
        </h2>
        <p className="mb-3">
          Pri prvej návšteve webovej stránky môžete: [cite: 75]
        </p>
        <ul className="list-disc pl-6 mb-3 space-y-1 text-gray-700">
          <li>Prijať všetky cookies, [cite: 76]</li>
          <li>Odmietnuť nepovinné cookies, [cite: 77]</li>
          <li>Nastaviť svoje preferencie. [cite: 78]</li>
        </ul>
        <p>
          Svoj súhlas môžete kedykoľvek zmeniť alebo odvolať. [cite: 79]
        </p>
      </section>

      {/* Куки третьих сторон */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
          Cookies tretích strán [cite: 80]
        </h2>
        <p className="mb-3">
          Na stránke môže byť vložený obsah sociálnych sietít alebo externých služieb. [cite: 81]
        </p>
        <p>
          Tieto služby môžu ukladať vlastné cookies v súlade so svojimi pravidlami ochrany osobných údajov. [cite: 82]
        </p>
      </section>

      {/* Контакты */}
      <section className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h2 className="text-2xl font-semibold mb-3 text-blue-950">
          Kontakt [cite: 83]
        </h2>
        <p className="mb-4 text-blue-900">
          V prípade otázok týkajúcich sa cookies nás kontaktujte: [cite: 84]
        </p>
        <div className="text-blue-950 font-medium space-y-1">
          <p>Serhii Belia [cite: 85]</p>
          <p>Abrahám 227, 925 45 Abrahám [cite: 85]</p>
          <p className="pt-2">E-mail: <a href="mailto:betonisimo.sk@gmail.com" className="underline hover:text-blue-800">betonisimo.sk@gmail.com</a> [cite: 86]</p>
          <p>Telefón: <a href="tel:+421952515556" className="underline hover:text-blue-800">+421 952 515 556</a> [cite: 86]</p>
        </div>
      </section>

      {/* Ссылки на настройки браузеров */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-900">
          Viac informácii o tom, ako je možné spravovať cookies policy najviac používanými prehliadačmi sa dozviete: [cite: 87]
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-blue-600 underline">
          <li>
            <a href="https://support.google.com/accounts/answer/61416?co=GENIE.Platform%3DDesktop&hl=en" target="_blank" rel="noopener noreferrer">
              Google Chrome [cite: 88, 89]
            </a>
          </li>
          <li>
            <a href="https://support.microsoft.com/sk-sk/help/4468242/microsoft-edge-browsing-data-and-privacy-microsoft-privacy" target="_blank" rel="noopener noreferrer">
              Microsoft Edge [cite: 90, 91]
            </a>
          </li>
          <li>
            <a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer">
              Mozilla Firefox [cite: 92, 93]
            </a>
          </li>
          <li>
            <a href="https://support.microsoft.com/en-gb/help/17442/windows-internet-explorer-delete-manage-cookies" target="_blank" rel="noopener noreferrer">
              Microsoft Internet Explorer [cite: 94, 95]
            </a>
          </li>
          <li>
            <a href="https://help.opera.com/cs/latest/" target="_blank" rel="noopener noreferrer">
              Opera [cite: 96, 97]
            </a>
          </li>
          <li>
            <a href="https://support.apple.com/en-gb/safari" target="_blank" rel="noopener noreferrer">
              Apple Safari [cite: 98, 99]
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}