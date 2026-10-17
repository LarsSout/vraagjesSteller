const ACCESS_KEY = "49df7ced-6dd6-4902-ba51-bcc3b586741f"; // <- plak hier je Web3Forms key

const vragen = [
    { id: "film",    tekst: "Wat is je favoriete film?",                    placeholder: "Bv. Titanic" },
    { id: "plannen", tekst: "Wat zijn je verdere plannen in het leven?",    placeholder: "Bv. Bakker blijven"},
    { id: "dier",    tekst: "Wat is je favoriete dier?",                    placeholder: "Bv. kat" },
    { id: "kleur",   tekst: "Wat is je favoriete kleur?",                   placeholder: "Bv. roze" },
    { id: "eten",    tekst: "Wat is je favoriete eten?",                    placeholder: "Bv. pizza" },
    { id: "reis",    tekst: "Naar welk land wil je ooit nog reizen?",       placeholder: "Bv. Japan" },
    { id: "muziek",  tekst: "Welk liedje of welke artiest luister je het meest?", placeholder: "Bv. Taylor Swift" },
    { id: "seizoen", tekst: "Wat is je favoriete seizoen?",                 placeholder: "Bv. zomer" },
    { id: "kracht",  tekst: "Welke superkracht zou je kiezen?",             placeholder: "Bv. kunnen vliegen" },
    { id: "hobby",   tekst: "Wat doe je graag in je vrije tijd.",           placeholder: "Bv. chatten met Lars Southcott" },
    { id: "extra",   tekst: "Wil je me nog iets vertellen?",                placeholder: "Mag leeg blijven", optioneel: true, lang: true }
];

// ====== STATE ======
const app = document.getElementById("app");
const antwoorden = {};
let huidige = 0;

function toonIntro() {
    app.innerHTML = `
        <h1>Vind je jezelf knap?</h1>
        <div class="speelveld" id="speelveld">
            <button id="ja">Ja</button>
            <button id="nee">Nee</button>
        </div>
    `;

    const veld = document.getElementById("speelveld");
    const ja = document.getElementById("ja");
    const nee = document.getElementById("nee");

    // beginpositie van "Nee" (onder "Ja")
    let pos = { x: 0, y: 0 };
    const zetPositie = () => {
        nee.style.left = pos.x + "px";
        nee.style.top = pos.y + "px";
    };
    const start = () => {
        pos.x = (veld.clientWidth - nee.offsetWidth) / 2;
        pos.y = veld.clientHeight - nee.offsetHeight - 10;
        nee.style.transition = "none";
        zetPositie();
        void nee.offsetWidth; // forceer layout, daarna transitie terug aan
        nee.style.transition = "";
    };
    start();

    let laatsteSprong = 0;
    const wegschuiven = (px, py) => {
        const nu = Date.now();
        if (nu - laatsteSprong < 500) return;
        laatsteSprong = nu;

        const veldRect = veld.getBoundingClientRect();
        const r = nee.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        let dx = cx - px;
        let dy = cy - py;
        const afstand = Math.hypot(dx, dy) || 1;
        dx /= afstand;
        dy /= afstand;

        const stap = 900;
        const maxX = veldRect.width - nee.offsetWidth;
        const maxY = veldRect.height - nee.offsetHeight;
        pos.x = Math.min(Math.max(pos.x + dx * stap, 0), maxX);
        pos.y = Math.min(Math.max(pos.y + dy * stap, 0), maxY);
        zetPositie();
    };

    const bijBeweging = (e) => {
        const r = nee.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        if (Math.hypot(e.clientX - cx, e.clientY - cy) < 110) {
            wegschuiven(e.clientX, e.clientY);
        }
    };
    document.addEventListener("pointermove", bijBeweging);
    nee.addEventListener("pointerdown", (e) => wegschuiven(e.clientX, e.clientY));

    const klaar = (keuze) => {
        document.removeEventListener("pointermove", bijBeweging);
        antwoorden["Vind je jezelf knap? (gekozen knop)"] = keuze;
        toonKnapResultaat();
    };
    ja.addEventListener("click", () => klaar("Ja"));
    nee.addEventListener("click", () => klaar("Nee (maar toch ja 😉)"));
}

function toonKnapResultaat() {
    app.innerHTML = `
        <div class="groot-emoji">💖</div>
        <h1>Je koos "ja", dit klopt!, je bent knap.</h1>
        <div class="knoppenrij">
            <button id="verder">Next</button>
        </div>
    `;
    document.getElementById("verder").addEventListener("click", () => {
        huidige = 0;
        toonVraag();
    });
}

function toonVraag() {
    const v = vragen[huidige];
    const laatste = huidige === vragen.length - 1;
    const procent = (huidige / vragen.length) * 100;
    const bewaard = antwoorden[v.id] || "";

    const invoer = v.lang
        ? `<textarea id="invoer" rows="4" placeholder="${v.placeholder}"></textarea>`
        : `<input type="text" id="invoer" placeholder="${v.placeholder}" autocomplete="off">`;

    app.innerHTML = `
        <div class="voortgang"><div style="width:${procent}%"></div></div>
        <div class="teller">Vraag ${huidige + 1} van ${vragen.length}</div>
        <h1>${v.tekst}</h1>
        ${invoer}
        <div class="knoppenrij">
            ${huidige > 0 ? '<button id="terug" class="knop-licht">Vorige</button>' : ""}
            <button id="volgende">${laatste ? "Versturen" : "Next"}</button>
        </div>
    `;

    const veld = document.getElementById("invoer");
    const volgende = document.getElementById("volgende");
    veld.value = bewaard;
    veld.focus();

    const controleer = () => {
        volgende.disabled = !v.optioneel && veld.value.trim() === "";
    };
    controleer();
    veld.addEventListener("input", controleer);

    const gaVerder = () => {
        if (volgende.disabled) return;
        antwoorden[v.id] = veld.value.trim();
        if (laatste) {
            verstuur();
        } else {
            huidige++;
            toonVraag();
        }
    };
    volgende.addEventListener("click", gaVerder);
    veld.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !v.lang) gaVerder();
    });

    const terug = document.getElementById("terug");
    if (terug) {
        terug.addEventListener("click", () => {
            antwoorden[v.id] = veld.value.trim();
            huidige--;
            toonVraag();
        });
    }
}

// ====== VERSTUREN NAAR WEB3FORMS ======
async function verstuur() {
    app.innerHTML = `<h1>Bezig met versturen...</h1>`;

    const data = {
        access_key: ACCESS_KEY,
        subject: "Nieuwe antwoorden!",
        "Vind je jezelf knap?": antwoorden["Vind je jezelf knap? (gekozen knop)"]
    };
    vragen.forEach((v) => { data[v.tekst] = antwoorden[v.id] || "-"; });

    try {
        const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        toonBedankt();
    } catch (err) {
        app.innerHTML = `
            <h1>Oeps, het is niet gelukt 😕</h1>
            <p>Probeer het nog eens.</p>
            <div class="knoppenrij"><button id="opnieuw">Opnieuw proberen</button></div>
        `;
        document.getElementById("opnieuw").addEventListener("click", verstuur);
    }
}

function toonBedankt() {
    app.innerHTML = `
        <div class="groot-emoji">🎉</div>
        <h1>Dankjewel! <br> je bent de beste</h1>
        <p>Je antwoorden zijn verstuurd 💛</p>
    `;
}

toonIntro();
