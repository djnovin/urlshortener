import React, { useEffect, useState } from "react";

const UrlShortener = () => {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [urls, setUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql";

  // Fetch all URLs from the server
  const fetchUrls = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query { getAllUrls }`,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch URLs.");
      const data = await response.json();
      setUrls(data.data.getAllUrls || []);
    } catch (err) {
      console.error("Error fetching URLs:", err);
      setError(err.message || "Could not connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle URL shortening
  const handleShorten = async () => {
    setError("");
    setShortUrl("");

    if (!longUrl.trim()) {
      setError("Please enter a valid URL.");
      return;
    }

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation ($url: String!) { createShortUrl(originalUrl: $url) }`,
          variables: { url: longUrl },
        }),
      });

      if (!response.ok) throw new Error("Failed to shorten the URL.");
      const data = await response.json();
      setShortUrl(data.data.createShortUrl);
      setLongUrl(""); // Clear input field after success
    } catch (err) {
      console.error("Error shortening URL:", err);
      setError(err.message || "Could not connect to the server.");
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-medium text-center mb-4">
        Shorten your links <br /> on the fly
      </h1>
      <p className="text-center">
        Simplify your links with our URL shortener. Just paste your long link
        and click the button to shorten it.
      </p>
      <div className="mt-8 border bg-blue-50 p-4 rounded-lg border-gray-300">
        <input
          className="border border-gray-300 p-2 rounded w-full"
          onChange={(e) => setLongUrl(e.target.value)}
          placeholder="Shorten any link..."
          type="text"
          value={longUrl}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mt-4 w-full"
          onClick={handleShorten}
          disabled={!longUrl.trim()}
        >
          Shorten
        </button>
        {shortUrl && (
          <p className="mt-4">
            Shortened URL:{" "}
            <a
              className="text-blue-500"
              href={`http://localhost:8000/${shortUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              http://localhost:8000/{shortUrl}
            </a>
          </p>
        )}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

      <div>
        {isLoading ? (
          <p className="text-center mt-8">Loading URLs...</p>
        ) : urls.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-2xl font-medium">All URLs</h2>
            <ul className="mt-4">
              {urls.map((url, index) => (
                <li key={index} className="text-blue-500">
                  <a
                    href={`http://localhost:8000/${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    http://localhost:8000/{url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-center mt-8">No URLs available.</p>
        )}
      </div>
    </div>
  );
};

export default UrlShortener;
