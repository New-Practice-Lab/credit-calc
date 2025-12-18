/**
 * Pure utility functions for the Credit Calculator.
 * These functions have no side effects and are easy to test.
 */

/**
 * Combines multiple FactDictionaryModule XML files into a single FactDictionary XML string.
 * Takes the Meta from the first file and merges all Facts sections.
 * Converts FactDictionaryModule root elements to FactDictionary for compatibility.
 */
export function combineFactDictionaries(...xmlStrings) {
  const parser = new DOMParser();

  // Parse the first XML to get the base structure
  const baseDoc = parser.parseFromString(xmlStrings[0], "text/xml");
  const baseFacts = baseDoc.querySelector("Facts");

  // Extract facts from all additional XML files
  for (let i = 1; i < xmlStrings.length; i++) {
    const doc = parser.parseFromString(xmlStrings[i], "text/xml");
    const facts = doc.querySelectorAll("Facts > Fact");

    // Append each fact to the base Facts section
    facts.forEach((fact) => {
      baseFacts.appendChild(fact.cloneNode(true));
    });
  }

  // Change root element from FactDictionaryModule to FactDictionary
  const root = baseDoc.documentElement;
  if (root.tagName === "FactDictionaryModule") {
    const newRoot = baseDoc.createElement("FactDictionary");
    // Copy all children from old root to new root
    while (root.firstChild) {
      newRoot.appendChild(root.firstChild);
    }
    // Replace the root element
    baseDoc.replaceChild(newRoot, root);
  }

  // Serialize back to XML string
  const serializer = new XMLSerializer();
  return serializer.serializeToString(baseDoc);
}

/**
 * Extracts the value from a Fact Graph result object.
 * Handles different result formats (.v, .get, .value properties or direct values).
 */
export function extractValue(result) {
  // Handle different result types
  if (result === null || result === undefined) {
    return "Incomplete";
  }

  // Try to get the value from various possible properties
  if (result.v !== undefined) {
    return result.v;
  }

  if (result.get !== undefined) {
    return result.get;
  }

  if (typeof result === "object" && result.value !== undefined) {
    return result.value;
  }

  return result;
}

/**
 * Displays the eligibility results in the UI.
 * Updates the result card, credit amounts, and eligibility checks.
 */
export function displayResults(results) {
  // Show results container
  document.getElementById("results").classList.add("show");

  const resultCard = document.getElementById("result-card");
  const creditAmountDiv = document.getElementById("credit-amount");
  const failureReasonDiv = document.getElementById("failure-reason");

  // Display main result
  // For now, we'll show a summary based on the checks
  const fedEitcPass =
    results.fedEitcIdCheck === true || results.fedEitcIdCheck === "true";
  const fedCtcPass =
    results.fedCtcIdCheck === true || results.fedCtcIdCheck === "true";
  const mdEitcPass =
    results.mdEitcIdCheck === true || results.mdEitcIdCheck === "true";

  // Display the federal EITC and CTC max amounts
  const eitcAmount =
    typeof results.federalEitcMaxAmount === "number"
      ? results.federalEitcMaxAmount
      : parseFloat(results.federalEitcMaxAmount) || 0;
  const ctcAmount =
    typeof results.federalCtcMaxRefundableAmount === "number"
      ? results.federalCtcMaxRefundableAmount
      : parseFloat(results.federalCtcMaxRefundableAmount) || 0;
  const mdEitcAmount =
    typeof results.mdEitcAmount === "number"
      ? results.mdEitcAmount
      : parseFloat(results.mdEitcAmount) || 0;

  // Check if any credits qualify
  const anyCreditsQualify =
    fedEitcPass || fedCtcPass || (results.filingState === "MD" && mdEitcPass);

  if (anyCreditsQualify) {
    resultCard.className = "result-card qualified";

    // Display max credit amounts
    const creditParts = [];
    let totalAmount = 0;

    if (eitcAmount > 0) {
      creditParts.push(`Federal EITC: ${formatCurrency(eitcAmount)}`);
      totalAmount += eitcAmount;
    }
    if (ctcAmount > 0) {
      creditParts.push(`Federal Refundable CTC: ${formatCurrency(ctcAmount)}`);
      totalAmount += ctcAmount;
    }

    // Display Maryland EITC if Maryland is selected and eligible
    if (results.filingState === "MD" && mdEitcAmount > 0) {
      creditParts.push(`Maryland EITC: ${formatCurrency(mdEitcAmount)}`);
      totalAmount += mdEitcAmount;
    }

    if (creditParts.length > 0) {
      // Add total if there are multiple credits
      if (creditParts.length > 1) {
        creditParts.push(
          `<br><strong>Total: ${formatCurrency(totalAmount)}</strong>`,
        );
      }
      creditAmountDiv.innerHTML = creditParts.join("<br>");
    } else {
      creditAmountDiv.textContent = "";
    }

    // Add special note for ITIN holders in Maryland
    let noteText =
      "This estimate is based on simplified tax rules and is not a tool for determining actual tax credit eligibility.";
    if (results.filingState === "MD" && mdEitcPass && !fedEitcPass) {
      noteText +=
        " ITIN holders qualify for Maryland EITC but not Federal EITC.";
    }
    failureReasonDiv.textContent = noteText;
  } else {
    resultCard.className = "result-card not-qualified";
    creditAmountDiv.textContent = formatCurrency(0);
    failureReasonDiv.textContent =
      "Based on your tax ID type and filing status, you do not meet the preliminary requirements for these credits.";
  }

  // Display detail checks
  displayCheck("fed-eitc-id-check", results.fedEitcIdCheck);
  displayCheck("fed-ctc-id-check", results.fedCtcIdCheck);

  // Show/hide and display Maryland EITC check based on selected state
  const mdEitcCheckItem = document.getElementById("md-eitc-id-check-item");
  if (results.filingState === "MD") {
    mdEitcCheckItem.style.display = "block";
    displayCheck("md-eitc-id-check", results.mdEitcIdCheck);
  } else {
    mdEitcCheckItem.style.display = "none";
  }
}

/**
 * Updates an eligibility check element with pass/fail status.
 */
export function displayCheck(elementId, value) {
  const element = document.getElementById(elementId);
  const boolValue = value === true || value === "true";

  if (boolValue) {
    element.textContent = "Eligible ✓";
    element.className = "detail-value pass";
  } else if (value === false || value === "false") {
    element.textContent = "Ineligible ✗";
    element.className = "detail-value fail";
  } else {
    element.textContent = "-";
    element.className = "detail-value";
  }
}

/**
 * Formats a number as US currency (e.g., $1,234).
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
