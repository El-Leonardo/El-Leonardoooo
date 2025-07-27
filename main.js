console.log("Game Loaded...")
   }
    #header {
      background: #2d3748;
      padding: 15px 20px;
      font-size: 1.7em;
      font-weight: bold;
      text-align: center;
      letter-spacing: 2px;
      border-bottom: 2px solid #444;
    }
    #tabs {
      display: flex;
      background: #222;
      border-bottom: 1px solid #333;
    }
    .tab {
      flex: 1;
      padding: 10px;
      text-align: center;
      cursor: pointer;
      background: #222;
      transition: background 0.2s;
      font-size: 1.1em;
    }
    .tab.active {
      background: #374151;
      color: #ffd700;
      font-weight: bold;
    }
    #content {
      padding: 15px;
      min-height: 360px;
    }
    .btn {
      background: #3b82f6;
      color: #fff;
      border: none;
      padding: 7px 20px;
      margin: 5px 2px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1em;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #2563eb;
    }
    .country-select {
      margin-bottom: 10px;
    }
    .panel {
      background: #23272f;
      padding: 10px;
      border-radius: 7px;
      margin-bottom: 15px;
    }
    .doctrine-list, .blueprint-list {
      list-style: none;
      padding-left: 0;
      margin: 0;
    }
    .doctrine-list li, .blueprint-list li {
      margin-bottom: 7px;
      background: #2d3143;
      padding: 7px;
      border-radius: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .doctrine-list .selected {
      background: #3b82f6;
      color: #fff;
      font-weight: bold;
    }
    .war-panel {
      margin-top: 10px;
      background: #23272f;
      padding: 10px;
      border-radius: 7px;
    }
    .war-status {
      margin-bottom: 8px;
      font-size: 1.1em;
      font-weight: bold;
    }
    .stats-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 5px;
    }
    .stats-table td, .stats-table th {
      border: 1px solid #333;
      padding: 4px 8px;
      text-align: center;
      background: #23272f;
    }
    .stats-table th {
      background: #374151;
      color: #ffd700;
    }
    @media (max-width: 600px) {
      #container { max-width: 99vw; }
      #content { min-height: 240px; }
    }
  </style>
</head>
<body>
  <div id="container">
    <div id="header">HOI4 Mobile Lite</div>
    <div id="tabs">
      <div class="tab active" data-tab="country">Country</div>
      <div class="tab" data-tab="production">Production</div>
      <div class="tab" data-tab="research">Research</div>
      <div class="tab" data-tab="doctrine">Doctrine</div>
      <div class="tab" data-tab="war">War</div>
    </div>
    <div id="content"></div>
  </div>
  <script>
    // === JS GAME LOGIC ===

    // --- Data ---
    const countries = [
      { name: "Germany", flag: "🇩🇪", color: "#222", units: { infantry: 50, tanks: 25, air: 30, navy: 10 }, resources: 300, blueprints: ["Panzer IV", "Messerschmitt Bf 109", "U-Boat"], doctrines: { ground: 0, air: 0, naval: 0 } },
      { name: "Soviet Union", flag: "🇷🇺", color: "#b22222", units: { infantry: 70, tanks: 18, air: 25, navy: 6 }, resources: 350, blueprints: ["T-34", "IL-2 Sturmovik", "Kirov-class"], doctrines: { ground: 0, air: 0, naval: 0 } },
      { name: "USA", flag: "🇺🇸", color: "#2e5cb8", units: { infantry: 40, tanks: 15, air: 40, navy: 30 }, resources: 380, blueprints: ["Sherman", "P-51 Mustang", "Essex-class"], doctrines: { ground: 0, air: 0, naval: 0 } },
      { name: "UK", flag: "🇬🇧", color: "#2d3143", units: { infantry: 30, tanks: 10, air: 35, navy: 28 }, resources: 320, blueprints: ["Churchill", "Spitfire", "King George V"], doctrines: { ground: 0, air: 0, naval: 0 } },
      { name: "Japan", flag: "🇯🇵", color: "#c71e1e", units: { infantry: 35, tanks: 8, air: 30, navy: 25 }, resources: 280, blueprints: ["Type 97 Chi-Ha", "Zero", "Yamato"], doctrines: { ground: 0, air: 0, naval: 0 } }
    ];

    const blueprints = [
      "Panzer IV", "T-34", "Sherman", "Churchill", "Type 97 Chi-Ha",
      "Messerschmitt Bf 109", "IL-2 Sturmovik", "P-51 Mustang", "Spitfire", "Zero",
      "U-Boat", "Kirov-class", "Essex-class", "King George V", "Yamato"
    ];

    const doctrines = {
      ground: [
        { name: "Mobile Warfare", desc: "Focus on fast armored units." },
        { name: "Mass Assault", desc: "Overwhelm with infantry numbers." },
        { name: "Grand Battleplan", desc: "Careful planning for defense and offense." }
      ],
      air: [
        { name: "Air Superiority", desc: "Dominate skies with fighters." },
        { name: "Strategic Destruction", desc: "Bomb enemy infrastructure." },
        { name: "Battlefield Support", desc: "Help ground troops with air support." }
      ],
      naval: [
        { name: "Fleet in Being", desc: "Strong surface fleet presence." },
        { name: "Base Strike", desc: "Carrier-based air power." },
        { name: "Raiding", desc: "Focus on submarines and commerce raiding." }
      ]
    };

    const researchTopics = [
      "Infantry Equipment Upgrade",
      "Tank Improvements",
      "Aircraft Designs",
      "Naval Innovations",
      "Radar Technology",
      "Logistics & Supply"
    ];

    // --- Game State ---
    let player = null;
    let AI = [];
    let currentTab = "country";
    let war = null; // { attacker: player, defender: AIcountry, status: "ongoing", turns: n }

    // --- HTML Rendering ---
    function renderTabs() {
      document.querySelectorAll(".tab").forEach(tab => {
        tab.classList.toggle("active", tab.dataset.tab === currentTab);
      });
    }

    function renderContent() {
      const content = document.getElementById("content");
      switch(currentTab) {
        case "country": renderCountry(content); break;
        case "production": renderProduction(content); break;
        case "research": renderResearch(content); break;
        case "doctrine": renderDoctrine(content); break;
        case "war": renderWar(content); break;
      }
    }

    // --- Tab Panels ---
    function renderCountry(container) {
      container.innerHTML = `
        <div class="panel">
          <div class="country-select">
            <label for="countryPick"><b>Select Country:</b></label>
            <select id="countryPick">${countries.map((c,i) =>
              `<option value="${i}" ${player===countries[i]?'selected':''}>${c.flag} ${c.name}</option>`
            ).join("")}</select>
          </div>
        </div>
        ${player ? `
          <div class="panel">
            <b>Stats:</b>
            <table class="stats-table">
              <tr><th>Resource</th><th>Infantry</th><th>Tanks</th><th>Air</th><th>Navy</th></tr>
              <tr>
                <td>${player.resources}</td>
                <td>${player.units.infantry}</td>
                <td>${player.units.tanks}</td>
                <td>${player.units.air}</td>
                <td>${player.units.navy}</td>
              </tr>
            </table>
            <b>Blueprints:</b>
            <ul class="blueprint-list">
            ${player.blueprints.slice(0,3).map(bp => `<li>${bp}</li>`).join("")}
            </ul>
          </div>
        ` : ""}
      `;
      document.getElementById("countryPick").onchange = e => {
        player = countries[+e.target.value];
        AI = countries.filter(c => c!==player);
        renderContent();
      };
      if (!player) {
        player = countries[0];
        AI = countries.slice(1);
      }
    }

    function renderProduction(container) {
      container.innerHTML = `
        <div class="panel">
          <b>Produce Equipment:</b>
          <ul>
            <li><button class="btn" onclick="produce('infantry')">Infantry (Cost 10)</button></li>
            <li><button class="btn" onclick="produce('tanks')">Tank (Cost 30)</button></li>
            <li><button class="btn" onclick="produce('air')">Aircraft (Cost 25)</button></li>
            <li><button class="btn" onclick="produce('navy')">Ship (Cost 40)</button></li>
          </ul>
          <div><b>Resources:</b> ${player.resources}</div>
        </div>
      `;
    }

    function renderResearch(container) {
      container.innerHTML = `
        <div class="panel">
          <b>Research:</b>
          <ul>
            ${researchTopics.map((topic,i) => `
              <li>
                ${topic}
                <button class="btn" onclick="research(${i})">Research</button>
              </li>
            `).join("")}
          </ul>
        </div>
      `;
    }

    function renderDoctrine(container) {
      container.innerHTML = `
        <div class="panel">
          <b>Ground Doctrines:</b>
          <ul class="doctrine-list">
            ${doctrines.ground.map((doc,i) => `
              <li class="${player.doctrines.ground===i?'selected':''}">
                ${doc.name}: <span>${doc.desc}</span>
                <button class="btn" onclick="selectDoctrine('ground',${i})">Select</button>
              </li>
            `).join("")}
          </ul>
        </div>
        <div class="panel">
          <b>Air Doctrines:</b>
          <ul class="doctrine-list">
            ${doctrines.air.map((doc,i) => `
              <li class="${player.doctrines.air===i?'selected':''}">
                ${doc.name}: <span>${doc.desc}</span>
                <button class="btn" onclick="selectDoctrine('air',${i})">Select</button>
              </li>
            `).join("")}
          </ul>
        </div>
        <div class="panel">
          <b>Naval Doctrines:</b>
          <ul class="doctrine-list">
            ${doctrines.naval.map((doc,i) => `
              <li class="${player.doctrines.naval===i?'selected':''}">
                ${doc.name}: <span>${doc.desc}</span>
                <button class="btn" onclick="selectDoctrine('naval',${i})">Select</button>
              </li>
            `).join("")}
          </ul>
        </div>
      `;
    }

    function renderWar(container) {
      // Diplomatic actions are minimal - just declare war.
      if (!war) {
        container.innerHTML = `
          <div class="panel">
            <b>Declare War:</b>
            <select id="targetCountry">
              ${AI.map((c,i) => `<option value="${i}">${c.flag} ${c.name}</option>`).join("")}
            </select>
            <button class="btn" id="declareWarBtn">Declare War</button>
          </div>
        `;
        document.getElementById("declareWarBtn").onclick = () => {
          const idx = +document.getElementById("targetCountry").value;
          war = { attacker: player, defender: AI[idx], status: "ongoing", turns: 0 };
          renderContent();
        };
      } else {
        // War simulation panel
        container.innerHTML = `
          <div class="war-panel">
            <div class="war-status">War: ${war.attacker.name} vs. ${war.defender.name}</div>
            <table class="stats-table">
              <tr>
                <th></th>
                <th>Infantry</th>
                <th>Tanks</th>
                <th>Aircraft</th>
                <th>Navy</th>
              </tr>
              <tr>
                <td>${war.attacker.flag} ${war.attacker.name}</td>
                <td>${war.attacker.units.infantry}</td>
                <td>${war.attacker.units.tanks}</td>
                <td>${war.attacker.units.air}</td>
                <td>${war.attacker.units.navy}</td>
              </tr>
              <tr>
                <td>${war.defender.flag} ${war.defender.name}</td>
                <td>${war.defender.units.infantry}</td>
                <td>${war.defender.units.tanks}</td>
                <td>${war.defender.units.air}</td>
                <td>${war.defender.units.navy}</td>
              </tr>
            </table>
            <button class="btn" onclick="battleTurn()">Next Turn</button>
            <button class="btn" onclick="endWar()">End War</button>
            <div id="warResult"></div>
          </div>
        `;
      }
    }

    // --- Game Actions ---
    window.produce = function(type) {
      const costs = { infantry: 10, tanks: 30, air: 25, navy: 40 };
      if (player.resources < costs[type]) {
        alert("Not enough resources!");
        return;
      }
      player.resources -= costs[type];
      player.units[type] += 1;
      renderContent();
    };

    window.research = function(idx) {
      if (!player.blueprints.includes(blueprints[idx])) {
        player.blueprints.push(blueprints[idx]);
        alert("Blueprint unlocked: "+blueprints[idx]);
      } else {
        alert("Already researched.");
      }
      renderContent();
    };

    window.selectDoctrine = function(branch, idx) {
      player.doctrines[branch] = idx;
      renderContent();
    };

    window.battleTurn = function() {
      war.turns++;
      // Simple battle: doctrine gives bonus, random factor
      function calcPower(country) {
        let pow = country.units.infantry + country.units.tanks*2 + country.units.air*1.5 + country.units.navy*1.2;
        pow *= 1 + (country.doctrines.ground+country.doctrines.air+country.doctrines.naval)*0.07;
        pow += Math.random()*5;
        return pow;
      }
      const attackPow = calcPower(war.attacker);
      const defendPow = calcPower(war.defender);

      let result = "";
      if (attackPow > defendPow) {
        war.defender.units.infantry = Math.max(0, war.defender.units.infantry - 3);
        war.defender.units.tanks = Math.max(0, war.defender.units.tanks - 1);
        war.defender.units.air = Math.max(0, war.defender.units.air - 1);
        war.defender.units.navy = Math.max(0, war.defender.units.navy - 1);
        result = `${war.attacker.name} wins turn ${war.turns}!`;
      } else {
        war.attacker.units.infantry = Math.max(0, war.attacker.units.infantry - 2);
        war.attacker.units.tanks = Math.max(0, war.attacker.units.tanks - 1);
        war.attacker.units.air = Math.max(0, war.attacker.units.air - 1);
        result = `${war.defender.name} holds turn ${war.turns}!`;
      }
      document.getElementById("warResult").innerText = result;

      // End war if one side is wiped
      if (
        war.defender.units.infantry+war.defender.units.tanks+war.defender.units.air+war.defender.units.navy === 0
      ) {
        document.getElementById("warResult").innerText = `${war.attacker.name} has conquered ${war.defender.name}!`;
      } else if (
        war.attacker.units.infantry+war.attacker.units.tanks+war.attacker.units.air+war.attacker.units.navy === 0
      ) {
        document.getElementById("warResult").innerText = `${war.defender.name} repelled the attack!`;
      }
      renderContent();
    };

    window.endWar = function() {
      war = null;
      renderContent();
    };

    // --- Tab Switch ---
    document.querySelectorAll(".tab").forEach(tab => {
      tab.onclick = () => {
        currentTab = tab.dataset.tab;
        renderTabs();
        renderContent();
      };
    });

    // --- Initial Render ---
    renderTabs();
    renderContent();
  </script>
</body>
</html>
`;
