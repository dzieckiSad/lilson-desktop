# Lilson Desktop

Chcę żebyś zaprojektował GUI idealne dla mojej desktop app i chcę żeby logo kota było 1:1 tam umieszczone:

Opis całego układu GUI — Lilson Desktop
Styl ogólny
Dark gray glassmorphism. Tło ciemnoszare, panele półprzezroczyste z lekkim blur. Akcenty w kolorze błękitu i zieleni. Zaokrąglone rogi, subtelne glowy na interaktywnych elementach. Czytelna hierarchia, dużo przestrzeni, profesjonalny wygląd.
Układ Desktop
Top Bar (górny pasek)
	•	Lewa strona: hamburger menu + logo kota w okręgu z niebiesko-zielonym glow + napis Lilson Desktop
	•	Środek/prawo: ikony wyszukiwania, powiadomień, ustawień
	•	Avatar użytkownika (Alex Morgan) z dropdown
	•	Przycisk + New Session (zielony)
Lewy Sidebar (Agents)
	•	Nagłówek „AGENTS • 6 Online”
	•	Lista kart agentów (Claude, Codex, Gemini, Llama, Mistral, Voyager)
	•	Każda karta: ikona, nazwa, model, zielona kropka statusu Online
	•	Na dole przycisk + Add Agent
Środek — Swarm Chat (główny obszar)
	•	Nagłówek „Swarm Chat • Live” + przycisk Share
	•	Wiadomości w bąbelkach:
	◦	Claude (Lead) z opisem architektury + załącznik pliku
	◦	Twoja wiadomość
	◦	Gemini z rekomendacją i paskiem postępu „Running simulation…”
	◦	Codex z wynikami i załącznikiem
	•	Na dole pole input „Ask the swarm anything…” + dropdown All Agents + przycisk wysyłania
Prawy Sidebar (Widgety)
	•	SWARM STATUS — okrągły wskaźnik, „All Systems Operational”, 6/6 Agents Online, Healthy
	•	Performance — mini wykresy (Tokens/sec, Latency, Errors)
	•	TERMINAL PREVIEW — live logi
	•	COST TRACKER — Session Cost, wykres, Estimated Monthly Cost
Bottom / Status
	•	Statusy środowiska, uptime, tasks, approvals, system load (w pełniejszej wersji)
Układ Mobilny (PWA)
	•	Top bar z logo kota + „Lilson Desktop”
	•	Główny ekran to czat
	•	Bottom navigation: Chat / Agents / Widgets / Automation / Settings
	•	Sidebary dostępne jako overlay lub osobne widoki
	•	Duże touch targets, kompaktowe karty
Logo
Okrągła ikona z kotem (czarno-biały, żółte oczy) w szklanej ramce z niebiesko-zielonym glow, pod spodem napis Lilson Desktop.
Całość jest zorganizowana tak, że czat jest centrum sterowania, a sidebary dostarczają kontekst (agenci po lewej, monitoring po prawej) bez przeciążania jednego ekranu.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ad0343f2-ae62-4786-ae25-07395f727a60).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
