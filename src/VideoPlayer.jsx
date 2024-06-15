import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState("");
  const [loading, setLoading] = useState(false);
  const baseURL = "https://animhey-sccz.vercel.app/meta/anilist/watch/";

  useEffect(() => {
    const fetchVideoUrl = async () => {

      setLoading(true); // Start loading
      const url = `${baseURL}${currentEpisode}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        setVideoUrl(data.sources[3].url);
      } catch (err) {
        console.error("Error fetching video URL:", err);
      } finally {
        setLoading(false); // End loading
        window.scrollTo({
          top: document.body.scrollHeight,
          left: 0,
          behavior: "smooth",
        });
      }
    };

    if (currentEpisode) {
      fetchVideoUrl();
    }
  }, [selectedTitle, currentEpisode]);

  useEffect(() => {
    if (videoUrl && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play();
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = videoUrl;
      videoRef.current.addEventListener("canplay", () => {
        videoRef.current.play();
      });
    }
  }, [videoUrl]);

  const fetchSearchResult = async (title) => {
    setLoading(true); // Start loading
    const searchURL = `https://animhey-sccz.vercel.app/meta/anilist/${title}?page=1`;
    try {
      const res = await fetch(searchURL);
      const resData = await res.json();
      setSearchResults(resData.results);
    } catch (err) {
      console.error("Error fetching search result:", err);
    } finally {
      setLoading(false); // End loading
      window.scrollTo({
        top: document.body.scrollHeight,
        left: 0,
        behavior: "smooth",
      });
    }
  };

  function handleTitleSearch(e) {
    const sanitizedTitle = e.target.value.replace(/\s+/g, "-");
    setSearchInput(sanitizedTitle);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchSearchResult(searchInput);
  }

  function handleTitleSelect(data, title) {
    setSelectedTitle(title);
    fetchID(data.id);
  }

  function handleEpisodeChange(e) {
    setCurrentEpisode(e.target.value);
  }

  async function fetchID(id) {
    setLoading(true); // Start loading
    try {
      const ID = await fetch(
        `https://animhey-sccz.vercel.app/meta/anilist/info/${id}`
      );
      const response = await ID.json();
      const episodeID = response.episodes;
      setEpisodes(episodeID.map((episode) => episode.id));
      setCurrentEpisode(episodeID[0].id);
    } catch (err) {
      console.error("Error fetching ID:", err);
    } finally {
      setLoading(false); // End loading
      window.scrollTo({
        top: document.body.scrollHeight,
        left: 0,
        behavior: "smooth",
      });
    }
  }

  return (
    <div>
      <h1>Anim-Hey!</h1>
      <p>by: Yengzzkie DzignTech</p>
      <h2>{selectedTitle}</h2>
      <form onSubmit={handleSearchSubmit}>
        <label htmlFor="title">Title </label>
        <input
          type="text"
          id="title"
          value={searchInput}
          onChange={handleTitleSearch}
        />
        <button type="submit">Search</button>
      </form>
      {loading ? (
        <p>Loading... Please wait</p>
      ) : (
        <ul className="results">
          {searchResults.map((data) => (
            <li
              key={data.id}
              onClick={() => handleTitleSelect(data, data.title.romaji)}
            >
              <span>{data.title.romaji}</span>
              <img src={data.image} className="results-image" alt={data.title.romaji} />
            </li>
          ))}
        </ul>
      )}
      <h3>Episodes:</h3>
      {loading ? (
        <p>Loading... Please wait</p>
      ) : (
        <>
          <select value={currentEpisode} onChange={handleEpisodeChange}>
            <option value="">Select Episode</option>
            {episodes.map((episode) => (
              <option key={episode} value={episode}>
                Episode {episode}
              </option>
            ))}
          </select>
          <video ref={videoRef} controls style={{ width: "100%" }}>
            <source src={videoUrl} />
          </video>
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
