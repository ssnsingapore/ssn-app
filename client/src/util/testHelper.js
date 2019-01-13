export const mockSuccessfulResponse = (body) => {
  const mockResponse = new Response(
    JSON.stringify(body),
  );
  mockResponse.isSuccessful = true;
  return mockResponse;
};

export const mockErrorResponse = (body) => {
  const mockResponse = new Response(
    JSON.stringify(body),
  );
  mockResponse.hasError = true;
  return mockResponse;
};