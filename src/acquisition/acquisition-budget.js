export const MAX_ACQUISITION_REQUESTS = 20;
let requestCount = 0;

export function consumeAcquisitionRequest(label = 'external request') {
  if (requestCount >= MAX_ACQUISITION_REQUESTS) {
    throw new Error(`The ${MAX_ACQUISITION_REQUESTS}-request session safety budget has been reached. Reload the page to begin a new controlled session.`);
  }
  requestCount += 1;
  return { requestNumber: requestCount, label };
}

export function acquisitionBudgetStatus() {
  return { used: requestCount, remaining: MAX_ACQUISITION_REQUESTS - requestCount, maximum: MAX_ACQUISITION_REQUESTS };
}

export function resetAcquisitionBudgetForTests() { requestCount = 0; }
