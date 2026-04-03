const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const counterValue = document.querySelector(".visitor-counter-value");

async function loadDailyVisitorCounter() {
  if (!counterValue) {
    return;
  }

  counterValue.textContent = "...";

  const chicagoDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  const namespace = "mrm-construction-site";
  const key = `daily-visits-${chicagoDate}`;
  const url = `https://api.countapi.xyz/hit/${namespace}/${key}`;

  try {
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`Counter request failed: ${response.status}`);
    }

    const data = await response.json();
    counterValue.textContent = String(data.value ?? 0);
  } catch (error) {
    counterValue.textContent = "N/A";
  }
}

loadDailyVisitorCounter();

const salesSystemRoot = document.querySelector("#lead-form");

if (salesSystemRoot) {
  const STORAGE_KEY = "mrm-sales-system-leads";
  const PIPELINE_STAGES = [
    "New Lead",
    "Contacted",
    "Qualified",
    "Quote Sent",
    "Hot Lead",
    "Closed Won",
    "Closed Lost"
  ];

  const leadForm = document.querySelector("#lead-form");
  const pipelineBoard = document.querySelector("#pipeline-board");
  const calculatorPrice = document.querySelector("#calculator-price");
  const monthlyPayment = document.querySelector("#monthly-payment");
  const paymentRange = document.querySelector("#payment-range");
  const quoteScript = document.querySelector("#quote-script");
  const adMarket = document.querySelector("#ad-market");
  const adBuyer = document.querySelector("#ad-buyer");
  const adHook = document.querySelector("#ad-hook");
  const generateAd = document.querySelector("#generate-ad");
  const generatedTitle = document.querySelector("#generated-title");
  const generatedBody = document.querySelector("#generated-body");
  const followupLead = document.querySelector("#followup-lead");
  const followupType = document.querySelector("#followup-type");
  const followupOutput = document.querySelector("#followup-output");
  const exportLeadsButton = document.querySelector("#export-leads");
  const clearLeadsButton = document.querySelector("#clear-leads");

  const adTemplates = {
    joplin: {
      garage: {
        title: "Built Tough for Joplin Garages & Shops",
        body: "Need a garage or shop on your property in Joplin, Webb City, or Carthage? We install steel buildings built for trucks, storage, and daily use. {{hook}} Message now for pricing and install timing."
      },
      shop: {
        title: "Joplin Shop Buildings for Work, Storage, or Business",
        body: "Running out of room for tools, work trucks, or side business storage? We help Missouri buyers get steel shop buildings installed fast. {{hook}} Ask for a quote today."
      },
      farm: {
        title: "Equipment Storage & Farm Shops Near Joplin",
        body: "Protect tractors, trailers, and equipment with a steel shop or garage built for rural property use. Serving Joplin, Neosho, and nearby areas. {{hook}}"
      },
      finance: {
        title: "Garage Financing Available in Joplin, MO",
        body: "Get the garage or shop you need without paying the full cost upfront. Company installation is handled for you and financing is available. {{hook}} Message now."
      }
    },
    arkansas: {
      garage: {
        title: "Custom Garages for Northwest Arkansas",
        body: "Serving Fayetteville, Springdale, Rogers, and Bentonville with steel garages built for vehicles, storage, and property value. {{hook}} Get pricing today."
      },
      shop: {
        title: "Northwest Arkansas Shop Buildings With Financing",
        body: "Need more work space for tools, equipment, or your business? Our steel shop buildings are built to last and installed for you. {{hook}}"
      },
      farm: {
        title: "Farm & Equipment Buildings for Northwest Arkansas",
        body: "Need a strong building for land, equipment, or utility storage? We help rural buyers across Northwest Arkansas get durable steel buildings with fast quotes. {{hook}}"
      },
      finance: {
        title: "No Large Upfront Cost for Your New Garage",
        body: "Financing makes it easier to move now instead of waiting. Get a garage or shop installed on your property with monthly options available across Northwest Arkansas. {{hook}}"
      }
    },
    regional: {
      garage: {
        title: "Garages & Shops for Joplin and Northwest Arkansas",
        body: "Serving Missouri and Northwest Arkansas buyers who need secure covered space for vehicles, tools, and storage. Company installation is handled for you. {{hook}}"
      },
      shop: {
        title: "Metal Shop Buildings Built for Home or Business Use",
        body: "From mechanics and contractors to property owners who need extra room, we help buyers across the region get practical steel shops that last. {{hook}}"
      },
      farm: {
        title: "Steel Buildings for Farm, Land, and Equipment Use",
        body: "Protect equipment and create usable work space with a garage or shop built for weather and heavy use. Serving Joplin and Northwest Arkansas. {{hook}}"
      },
      finance: {
        title: "Easy Monthly Payments on Garages & Shops",
        body: "Stop waiting on a large upfront number. We offer financing and company installation for garage and shop buyers across Joplin and Northwest Arkansas. {{hook}}"
      }
    }
  };

  function loadLeads() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  }

  function saveLeads(leads) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);
  }

  function calculatePayment(price) {
    if (!price || price <= 0) {
      return 0;
    }

    return price / 21.5;
  }

  function updateCalculator() {
    const price = Number(calculatorPrice.value || 0);
    const payment = calculatePayment(price);
    const low = payment * 0.9;
    const high = payment * 1.1;

    monthlyPayment.textContent = formatCurrency(payment);
    paymentRange.textContent = `${formatCurrency(low)} - ${formatCurrency(high)}`;
    quoteScript.textContent = `Most of our buildings in this range run about ${formatCurrency(low)} to ${formatCurrency(high)} per month depending on size and options. Want me to get you an exact quote?`;
  }

  function buildAd() {
    const market = adMarket.value;
    const buyer = adBuyer.value;
    const template = adTemplates[market][buyer];
    const hook = adHook.value.trim() || "Financing available";

    generatedTitle.textContent = template.title;
    generatedBody.textContent = template.body.replace("{{hook}}", hook);
  }

  function buildFollowUpMessage(lead, type) {
    const payment = formatCurrency(calculatePayment(Number(lead.price)));
    const builderLine = lead.builderUrl
      ? ` I also saved your 3D builder quote here: ${lead.builderUrl}`
      : "";

    const messages = {
      instant: `Hey ${lead.name}, this is Mike with garages and shops. Are you looking for a ${lead.buildingType.toLowerCase()} or a full shop?`,
      qualification: `Perfect. I have you down for a ${lead.size} ${lead.buildingType.toLowerCase()} in ${lead.city}. Is this mostly for ${lead.useCase.toLowerCase()}?`,
      quote: `Based on the ${lead.size} ${lead.buildingType.toLowerCase()} you asked about in ${lead.city}, most builds in that range run around ${payment}/month depending on options. Want me to get you exact pricing?${builderLine}`,
      day1: `Checking in on the ${lead.size} ${lead.buildingType.toLowerCase()} you asked about for ${lead.city}. Do you still want pricing and install timing?`,
      day3: `Most customers looking at a ${lead.buildingType.toLowerCase()} like yours use financing to get started. Want me to break down options for your ${lead.size}?`,
      day7: `Wanted to follow up one last time on your ${lead.size} ${lead.buildingType.toLowerCase()} for ${lead.city}. If you want, I can still get exact pricing and check install availability.`
    };

    return messages[type] || "";
  }

  function updateFollowupLeadOptions(leads) {
    followupLead.innerHTML = "";

    if (!leads.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No leads yet";
      followupLead.appendChild(option);
      followupOutput.value = "";
      return;
    }

    leads.forEach((lead) => {
      const option = document.createElement("option");
      option.value = lead.id;
      option.textContent = `${lead.name} - ${lead.city} - ${lead.size}`;
      followupLead.appendChild(option);
    });

    updateFollowupMessage(leads);
  }

  function updateFollowupMessage(leads) {
    const lead = leads.find((item) => item.id === followupLead.value) || leads[0];

    if (!lead) {
      followupOutput.value = "";
      return;
    }

    if (!followupLead.value) {
      followupLead.value = lead.id;
    }

    followupOutput.value = buildFollowUpMessage(lead, followupType.value);
  }

  function createLeadCard(lead, leads) {
    const card = document.createElement("article");
    card.className = "pipeline-card";

    const payment = formatCurrency(calculatePayment(Number(lead.price)));
    const builderMeta = [];

    if (lead.roofStyle) {
      builderMeta.push(lead.roofStyle);
    }

    if (lead.colors) {
      builderMeta.push(lead.colors);
    }

    card.innerHTML = `
      <h4>${lead.name}</h4>
      <p>${lead.city}</p>
      <p>${lead.buildingType} | ${lead.size}</p>
      <p>${formatCurrency(Number(lead.price))} est. | ${payment}/mo</p>
      <p>${lead.useCase}</p>
      ${builderMeta.length ? `<p>${builderMeta.join(" | ")}</p>` : ""}
      ${lead.builderSummary ? `<p>${lead.builderSummary}</p>` : ""}
      ${lead.builderUrl ? `<p><a href="${lead.builderUrl}" target="_blank" rel="noreferrer">Open saved builder quote</a></p>` : ""}
    `;

    const actions = document.createElement("div");
    actions.className = "pipeline-actions";

    PIPELINE_STAGES.forEach((stage) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `stage-pill${stage === lead.stage ? " active" : ""}`;
      button.textContent = stage;
      button.addEventListener("click", () => {
        const nextLeads = leads.map((item) =>
          item.id === lead.id ? { ...item, stage } : item
        );
        saveLeads(nextLeads);
        renderSalesSystem();
      });
      actions.appendChild(button);
    });

    card.addEventListener("click", (event) => {
      if (event.target.tagName === "BUTTON") {
        return;
      }

      followupLead.value = lead.id;
      updateFollowupMessage(loadLeads());
    });

    card.appendChild(actions);
    return card;
  }

  function renderPipeline(leads) {
    pipelineBoard.innerHTML = "";

    PIPELINE_STAGES.forEach((stage) => {
      const column = document.createElement("section");
      column.className = "pipeline-column";

      const header = document.createElement("div");
      header.className = "pipeline-column-header";
      header.innerHTML = `<h3>${stage}</h3><span>${leads.filter((lead) => lead.stage === stage).length}</span>`;

      column.appendChild(header);

      const stageLeads = leads.filter((lead) => lead.stage === stage);

      if (!stageLeads.length) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "No leads here yet.";
        column.appendChild(empty);
      } else {
        stageLeads.forEach((lead) => {
          column.appendChild(createLeadCard(lead, leads));
        });
      }

      pipelineBoard.appendChild(column);
    });
  }

  function renderSalesSystem() {
    const leads = loadLeads();
    renderPipeline(leads);
    updateFollowupLeadOptions(leads);
    updateCalculator();
    buildAd();
  }

  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(leadForm);
    const lead = {
      id: crypto.randomUUID(),
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      buildingType: String(formData.get("buildingType") || "").trim(),
      size: String(formData.get("size") || "").trim(),
      price: Number(formData.get("price") || 0),
      builderUrl: String(formData.get("builderUrl") || "").trim(),
      roofStyle: String(formData.get("roofStyle") || "").trim(),
      colors: String(formData.get("colors") || "").trim(),
      useCase: String(formData.get("useCase") || "").trim(),
      financing: String(formData.get("financing") || "").trim(),
      builderSummary: String(formData.get("builderSummary") || "").trim(),
      notes: String(formData.get("notes") || "").trim(),
      stage: "New Lead",
      createdAt: new Date().toISOString()
    };

    const leads = loadLeads();
    leads.unshift(lead);
    saveLeads(leads);
    leadForm.reset();
    leadForm.querySelector('[name="buildingType"]').value = "Garage";
    leadForm.querySelector('[name="useCase"]').value = "Home Garage";
    leadForm.querySelector('[name="financing"]').value = "Yes";
    renderSalesSystem();
    followupLead.value = lead.id;
    updateFollowupMessage(loadLeads());
  });

  calculatorPrice.addEventListener("input", updateCalculator);
  generateAd.addEventListener("click", buildAd);
  adMarket.addEventListener("change", buildAd);
  adBuyer.addEventListener("change", buildAd);
  adHook.addEventListener("input", buildAd);
  followupLead.addEventListener("change", () => updateFollowupMessage(loadLeads()));
  followupType.addEventListener("change", () => updateFollowupMessage(loadLeads()));

  exportLeadsButton.addEventListener("click", () => {
    const leads = loadLeads();
    const blob = new Blob([JSON.stringify(leads, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mrm-sales-leads.json";
    link.click();
    URL.revokeObjectURL(url);
  });

  clearLeadsButton.addEventListener("click", () => {
    const confirmed = window.confirm("Clear all saved leads from this browser?");

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    renderSalesSystem();
  });

  renderSalesSystem();
}
