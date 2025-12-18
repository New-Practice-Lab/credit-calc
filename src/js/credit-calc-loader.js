import {
  combineFactDictionaries,
  displayCheck,
  displayResults,
  extractValue,
  formatCurrency,
} from "./credit-calc-utils.js";
import * as fg from "./factgraph-opt.js";

let factGraph;

// Load the Credit Calculator fact dictionary on page load
window.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch multiple fact dictionary XML files
    const [demographicsResponse, eitcResponse, ctcResponse, mdEitcResponse] =
      await Promise.all([
        fetch("./facts/credit-calc.xml"), // Shared demographics
        fetch("./facts/federal-eitc.xml"), // EITC-specific facts
        fetch("./facts/federal-ctc.xml"), // CTC-specific facts
        fetch("./facts/md-eitc.xml"), // Maryland EITC-specific facts
      ]);

    const [demographicsXml, eitcXml, ctcXml, mdEitcXml] = await Promise.all([
      demographicsResponse.text(),
      eitcResponse.text(),
      ctcResponse.text(),
      mdEitcResponse.text(),
    ]);

    // Combine the XML files
    const combinedXml = combineFactDictionaries(
      demographicsXml,
      eitcXml,
      ctcXml,
      mdEitcXml,
    );

    // Initialize the fact dictionary and graph
    const factDictionary = fg.FactDictionaryFactory.importFromXml(combinedXml);
    factGraph = fg.GraphFactory.apply(factDictionary);

    console.log("Credit Calculator Fact Graph loaded successfully");
    hideError();
  } catch (error) {
    showError("Failed to load fact dictionary: " + error.message);
    console.error("Error loading fact dictionary:", error);
  }
});

// Handle form submission
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("credit-calc-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    checkEligibility();
  });
});

function checkEligibility() {
  try {
    hideError();

    // Get form values
    const formData = new FormData(document.getElementById("credit-calc-form"));

    // Helper function to set values
    const setFact = (path, value) => {
      try {
        console.log(`Setting ${path} to "${value}"`);
        factGraph.set(path, value);
        console.log(`✓ Successfully set ${path}`);
      } catch (e) {
        console.error(`✗ Error setting ${path}:`, e.message);
        throw e;
      }
    };

    // Set filing state
    const filingState = formData.get("filingState");
    if (!filingState) {
      showError("Please select a state");
      return;
    }
    setFact("/filingState", filingState);

    // Set filing status
    const filingStatus = formData.get("filingStatus");
    if (!filingStatus) {
      showError("Please select a filing status");
      return;
    }
    setFact("/filingStatus", filingStatus);

    // Set primary filer tax ID
    const primaryTaxId = formData.get("primaryFilerTaxId");
    if (!primaryTaxId) {
      showError("Please select your tax ID type");
      return;
    }
    setFact("/primaryFilerTaxId", primaryTaxId);

    // Set secondary filer tax ID if married filing jointly
    if (filingStatus === "MarriedFilingJointly") {
      const secondaryTaxId = formData.get("secondaryFilerTaxId") || "Neither";
      setFact("/secondaryFilerTaxId", secondaryTaxId);
    } else {
      // Set default for non-MFJ filers
      setFact("/secondaryFilerTaxId", "Neither");
    }

    // Set number of qualifying children
    const numQC = formData.get("numQualifyingChildren") || "0";
    setFact("/numQualifyingChildren", numQC);

    // Get computed results
    const fedEitcIdCheck = factGraph.get("/filersHaveValidIdsForFederalEitc");
    const fedCtcIdCheck = factGraph.get("/filersHaveValidIdsForFederalCtc");
    const mdEitcIdCheck = factGraph.get("/filersHaveValidIdsForMdEitc");
    const eitcIncomeLimit = factGraph.get("/eitcIncomeLimit");
    const federalEitcMaxAmount = factGraph.get("/federalEitcMaxAmount");
    const federalCtcMaxRefundableAmount = factGraph.get(
      "/federalCtcMaxRefundableAmount",
    );
    const mdEitcAmount = factGraph.get("/mdEitcAmount");

    // Note: AGI is currently hardcoded to $25,000 in the fact dictionary
    // When we add AGI as a writable field, we'll check against it
    const adjustedGrossIncome = factGraph.get("/adjustedGrossIncome");

    // Display results
    displayResults({
      filingState: filingState,
      fedEitcIdCheck: extractValue(fedEitcIdCheck),
      fedCtcIdCheck: extractValue(fedCtcIdCheck),
      mdEitcIdCheck: extractValue(mdEitcIdCheck),
      eitcIncomeLimit: extractValue(eitcIncomeLimit),
      adjustedGrossIncome: extractValue(adjustedGrossIncome),
      federalEitcMaxAmount: extractValue(federalEitcMaxAmount),
      federalCtcMaxRefundableAmount: extractValue(
        federalCtcMaxRefundableAmount,
      ),
      mdEitcAmount: extractValue(mdEitcAmount),
    });

    // Display graph JSON
    displayGraphJson();
  } catch (error) {
    showError("Error checking eligibility: " + error.message);
    console.error("Error:", error);
  }
}

function displayGraphJson() {
  try {
    const json = factGraph.toJSON();
    const prettyJson = JSON.stringify(JSON.parse(json), null, 2);
    document.getElementById("graph-json-content").textContent = prettyJson;
  } catch (error) {
    console.error("Error displaying graph JSON:", error);
  }
}

function showError(message) {
  const errorDiv = document.getElementById("error");
  const errorText = errorDiv.querySelector(".usa-alert__text");
  errorText.textContent = message;
  errorDiv.classList.add("show");
  errorDiv.classList.remove("hidden");
  // Scroll to error
  errorDiv.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideError() {
  const errorDiv = document.getElementById("error");
  errorDiv.classList.remove("show");
  errorDiv.classList.add("hidden");
}

function resetForm() {
  document.getElementById("credit-calc-form").reset();
  document.getElementById("results").classList.remove("show");
  document.getElementById("graph-json").classList.remove("show");
  document.getElementById("spouseFields").classList.remove("show");
  hideError();

  // Recreate the graph to clear all data
  if (factGraph) {
    Promise.all([
      fetch("./facts/credit-calc.xml"),
      fetch("./facts/federal-eitc.xml"),
      fetch("./facts/federal-ctc.xml"),
      fetch("./facts/md-eitc.xml"),
    ])
      .then((responses) => Promise.all(responses.map((r) => r.text())))
      .then((xmlTexts) => {
        const combinedXml = combineFactDictionaries(...xmlTexts);
        const factDictionary =
          fg.FactDictionaryFactory.importFromXml(combinedXml);
        factGraph = fg.GraphFactory.apply(factDictionary);
      })
      .catch((error) => {
        console.error("Error resetting graph:", error);
      });
  }
}

function toggleGraphJson() {
  const graphJsonDiv = document.getElementById("graph-json");
  graphJsonDiv.classList.toggle("show");
}

// Make functions available globally
window.resetForm = resetForm;
window.toggleGraphJson = toggleGraphJson;
