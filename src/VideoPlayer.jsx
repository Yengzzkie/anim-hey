import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState('1')
  const baseURL = 'https://animhey-sccz.vercel.app/meta/anilist/watch/'

  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (!selectedTitle || !currentEpisode) return;
      const sanitizedTitle = selectedTitle.replace(/\s+/g, '-');
      const queryParams = encodeURIComponent(sanitizedTitle)
      const url = `${baseURL}${queryParams}-episode-${currentEpisode}`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(url);
        console.log(data);
        console.log(videoUrl)
        setVideoUrl(data.sources[3].url);
      } catch (err) {
        console.error("Error fetching video URL:", err);
      }
    };

    fetchVideoUrl();
  }, [selectedTitle, currentEpisode]);

  useEffect(() => {
    if (videoUrl && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play();
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = videoUrl;
      videoRef.current.addEventListener('canplay', () => {
        videoRef.current.play();
      });
    }
  }, [videoUrl]);

  const fetchSearchResult = async (title) => {
    const searchURL = `https://animhey-sccz.vercel.app/meta/anilist/${title}?page=1`;
    try {
      const res = await fetch(searchURL);
      const resData = await res.json();
      console.log(resData.results);
      const filteredResult = resData.results.filter((data) => data.type === 'TV');
      console.log(filteredResult)
      setSearchResults(filteredResult);
    } catch (err) {
      console.error("Error fetching search result:", err);
    }
  };

  function handleTitleSearch(e) {
    const sanitizedTitle = e.target.value.replace(/\s+/g, '-');
    setSearchInput(sanitizedTitle);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setCurrentEpisode('1')
    fetchSearchResult(searchInput);
  }

  function handleTitleSelect(data, title) {
    setSelectedTitle(title);
    setCurrentEpisode('1')
    const episodesArray = [];
    for (let i = 1; i <= data.currentEpisodeCount; i++) {
      episodesArray.push(i);
    }
    setEpisodes(episodesArray);
  }

  function handleEpisodeChange(e) {
    setCurrentEpisode(e.target.value);
    console.log("Selected Episode:", e.target.value);
  }

  return (
    <div>
      <h1>Anim-Hey!</h1>
      <h2>{selectedTitle}</h2>
      <form onSubmit={handleSearchSubmit}>
        <label htmlFor="title">Title </label>
        <input type="text" id="title" value={searchInput} onChange={handleTitleSearch} />
        <button type="submit">Search</button>
      </form>
      <ul className='results'>
        {searchResults.map((data) => (
          <li key={data.id} onClick={() => handleTitleSelect(data, data.title.romaji)}>
            <span>{data.title.romaji}</span>
            <img src={data.image} width="150px"/>
          </li>
        ))}
      </ul>
      <h3>Episodes:</h3>
      <select value={currentEpisode} onChange={handleEpisodeChange}>
        <option value="">Select Episode</option>
        {episodes.map((episode) => (
          <option key={episode} value={episode}>Episode {episode}</option>
        ))}
      </select>
      <video ref={videoRef} controls style={{ width: '100%' }}><source src={videoUrl}/> </video>
    </div>
  );
};

export default VideoPlayer;
