exports.handler = async function (event, context) {
  try {
    const city = event.queryStringParameters.city || "London";
    const unit = event.queryStringParameters.unit || "metric";
    const lat = event.queryStringParameters.lat;
    const lon = event.queryStringParameters.lon;

    const apiKey = process.env.OPENWEATHER_API_KEY;

    let url;
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${unit}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong" }),
    };
  }
};
