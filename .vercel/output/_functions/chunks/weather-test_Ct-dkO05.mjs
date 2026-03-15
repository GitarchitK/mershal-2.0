const GET = async () => {
  const apiKey = "392d1cb45dfd42508b3201003261403";
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=Kolkata&aqi=no`
    );
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({
        error: "Weather API request failed",
        status: response.status,
        message: errorText,
        apiKeyPresent: true,
        apiKeyLength: apiKey.length
      }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    const data = await response.json();
    return new Response(JSON.stringify({
      success: true,
      data,
      apiKeyPresent: true
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Failed to fetch weather",
      message: error instanceof Error ? error.message : "Unknown error",
      apiKeyPresent: true
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
