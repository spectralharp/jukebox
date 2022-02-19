import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faFastForward, faFastBackward } from '@fortawesome/free-solid-svg-icons';

export default function MusicControl({ isPlaying, playPause, prev, next }) {
  return (
    <div className="control-buttons">
      <button className="control-button--prev" onClick={prev}>
        <FontAwesomeIcon icon={faFastBackward} />
      </button>
      <button className="control-button--play" onClick={playPause}>
        {isPlaying ?
          <FontAwesomeIcon icon={faPause} /> :
          <FontAwesomeIcon icon={faPlay} />
        }
      </button>
      <button className="control-button--next" onClick={next}>
        <FontAwesomeIcon icon={faFastForward} />
      </button>
    </div>
  );
}