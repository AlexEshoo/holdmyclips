import React, { useEffect, useState } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import { Clip, ClipDex } from './types';
import { getUsername } from './services/cognito';
import { secondsToMMSS } from './services/time';

export function Home() {
  const [clips, setClips] = useState<ClipDex>({});
  const username = getUsername();

  useEffect(() => {
    async function getClips() {
      let endpoint = '';
      if (process.env.NODE_ENV === 'development') {
        endpoint = 'http://localhost:3001';
      }

      const res = await fetch(`${endpoint}/clips`);
      const data = await res.json();

      const clipList: ClipDex = {};
      // I think S3 serves the data as a string, so we need JSON.parse somewhere in here
      // TODO: see if I can reconcile the two approaches

      let clipsData;
      if (process.env.NODE_ENV === 'development') {
        clipsData = data.clips;
      } else {
        clipsData = JSON.parse(data).clips;
      }

      clipsData.forEach((clip: Clip) => {
        clipList[clip.id] = clip;
      });

      setClips(clipList);
    }

    if (!clips.length) {
      getClips();
    }
  }, []);

  return (
    <div className='home'>
      <div className='upload-button-row'>
        {username ? (
          <a className='link' id='upload-link' href='/upload' rel='noreferrer'>
            <button>Upload clip</button>
          </a>
        ) : (
          <a
            className='link'
            id='signin-link'
            href='/signedin'
            rel='noreferrer'
          >
            <button>Sign in</button>
          </a>
        )}
      </div>
      <div className='clip-rows'>
        {Object.entries(clips).map(([clipId, clip]) => (
          <ClipCard key={clipId} clip={clip} />
        ))}
      </div>
    </div>
  );
}

function ClipCard(props: { clip: Clip }) {
  const clip = props.clip;
  const [showDetails, setShowDetails] = useState<boolean>(false);

  return (
    <div
      className='clip-card-container'
      key={clip.id}
      onMouseOver={() => setShowDetails(true)}
      onMouseOut={() => setShowDetails(false)}
    >
      <Link to={`/player/${clip.id}`} className='clip-link'>
        <div className='clip-card'>
          <img
            src={`https://clips.dunned024.com/clips/${clip.id}/${clip.id}.png`}
            alt={clip.title}
          />
          <div className='clip-duration'>{secondsToMMSS(clip.duration)}</div>
          {showDetails && (
            <div className='clip-card-body'>
              <div className='clip-title'>{clip.title}</div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
