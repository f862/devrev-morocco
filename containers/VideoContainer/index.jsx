import React, { memo, useMemo } from 'react';
import {
  Video_Container,
  VideoWrapper,
  VideoThumbnailContainer,
  VideoThumbnailWrapper,
  Inner_btn,
  Icon_btn,
  VideoContainer_Body_wrap,
  VideoContainer_body,
  VideoContainer_body_Title,
  VideoContainer_body_Details,
  Slider
} from './styles';
import PropTypes from 'prop-types';
import { CheckedSvg, ClockSvg } from '../../components/svgs';
import { useMediaQuery, useWL } from '../../hooks';
import Link from 'next/link';
import Image from 'next/image';
import { Timer } from '../../utils';
import { useRouter } from 'next/router';

const VideoContainer = ({ Episode, Season, CurrentVidId, PlayingState }) => {
  const Router = useRouter();

  const mediaQueryMatches = useMediaQuery('max-width', 735);
  const [StoredValue, setLocalStorage] = useWL();

  const HandleThumbnailLink = () => {
    Router.push({
      pathname: `/playlist/[season]/[episode]`,
      query: { season: Season, episode: Episode?.stringUrl }
    });

    window?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const HandleHoverIn = () => {
    const slider = document.getElementById(`wl-${Episode?.videoId}`);

    if (slider) {
      slider.style.position = 'relative';
      slider.style.zIndex = '1';
      slider.style.transform = 'translateX(0)';
    }
  };

  const HandleHoverOut = () => {
    const slider = document.getElementById(`wl-${Episode?.videoId}`);

    if (slider) {
      slider.style.zIndex = '0';
      slider.style.transform = 'translateX(135px)';

      Timer(350).then(() => {
        slider.style.position = 'absolute';
      });
    }
  };

  const Check = () => {
    const isVidId = StoredValue?.wl?.find((ep) => {
      if (ep?.videoId === Episode?.videoId) return true;
      return false;
    });
    return Boolean(isVidId);
  };

  const IswatchLater = useMemo(() => Check(), [StoredValue]);

  const HandleWLClick = () => {
    const AddNewWlVideo = {
      description: Episode?.description[0],
      title: Episode?.title,
      thumbnail: Episode?.thumbnail,
      season: Episode?.season,
      stringUrl: Episode?.stringUrl,
      duration: Episode?.duration,
      videoId: Episode?.videoId
    };

    if (IswatchLater) {
      const NewWlList = StoredValue?.wl.filter((ep) => {
        return ep?.videoId !== Episode?.videoId;
      });
      setLocalStorage({ wl: [...(NewWlList ?? [])] });
    } else {
      setLocalStorage({
        wl: [...(StoredValue?.wl ?? []), AddNewWlVideo]
      });
    }
  };

  const thisPlaying = PlayingState === 1;

  return (
    <Video_Container>
      <VideoWrapper>
        <VideoThumbnailContainer
          Width={mediaQueryMatches ? 140 : 160}
          isVid={Episode?.videoId === CurrentVidId}
          isPlaying={thisPlaying}
        >
          <VideoThumbnailWrapper
            Width={mediaQueryMatches ? 140 : 160}
            onClick={HandleThumbnailLink}
          >
            <Image
              src={Episode?.thumbnail}
              width={mediaQueryMatches ? 140 : 160}
              // To calculate the height use (w/h)=(16/9) => h=(w.9)/16
              height={mediaQueryMatches ? (140 * 9) / 16 : (160 * 9) / 16}
              quality={95}
            />
          </VideoThumbnailWrapper>
          {Episode?.duration && (
            <Inner_btn className="inner_btn--duration">
              {Episode?.duration?.toHHMMSS() ?? ''}
            </Inner_btn>
          )}
          <Inner_btn
            onMouseEnter={HandleHoverIn}
            onMouseLeave={HandleHoverOut}
            onClick={HandleWLClick}
            className="inner_btn--clock"
          >
            <Icon_btn>
              {IswatchLater ? (
                <div className="icon_btn__check">
                  <CheckedSvg />
                </div>
              ) : (
                <ClockSvg />
              )}
            </Icon_btn>
            <Slider id={`wl-${Episode?.videoId}`}>
              {IswatchLater ? (
                <div className="slider__check">added</div>
              ) : (
                <div className="slider__normal">watch later</div>
              )}
            </Slider>
          </Inner_btn>
        </VideoThumbnailContainer>
        <Link
          href={{
            pathname: '/playlist/[season]/[episode]',
            query: {
              season: Season,
              episode: Episode?.stringUrl
            }
          }}
          passHref
        >
          <VideoContainer_body as="a">
            <VideoContainer_Body_wrap>
              <VideoContainer_body_Title>
                {Episode?.title}
              </VideoContainer_body_Title>
              <VideoContainer_body_Details>
                {Episode?.description[0]}
              </VideoContainer_body_Details>
            </VideoContainer_Body_wrap>
          </VideoContainer_body>
        </Link>
      </VideoWrapper>
    </Video_Container>
  );
};

VideoContainer.propTypes = {
  Season: PropTypes.string,
  CurrentVidId: PropTypes.string,
  PlayingState: PropTypes.number,
  Episode: PropTypes.shape({
    ep: PropTypes.number.isRequired,
    season: PropTypes.number.isRequired,
    stringUrl: PropTypes.string.isRequired,
    videoId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    thumbnail: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    description: PropTypes.arrayOf(PropTypes.string)
  })
};

export default memo(VideoContainer);
