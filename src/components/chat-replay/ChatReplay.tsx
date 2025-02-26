import { useEffect, useRef, useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from './Badge'

interface ChatComment {
  _id: string
  created_at: string
  content_offset_seconds: number
  commenter: {
    display_name: string
    name: string
    logo?: string
  }
  message: {
    body: string
    user_color?: string
    user_badges?: Array<{
      _id: string
      version: string
    }>
  }
}

interface ChatData {
  comments: ChatComment[]
  video: {
    title: string
    created_at: string
    length: number
  }
}

interface ChatReplayProps {
  chatReplayURL: string
  youtubeId: string | undefined
}

interface YouTubePlayer {
  getCurrentTime(): number;
  getPlayerState(): number;
  destroy(): void;
}

interface YouTubeEvent {
  target: YouTubePlayer;
  data: number;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, any>;
          events?: Record<string, (event: YouTubeEvent) => void>;
        }
      ) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default function ChatReplay({ chatReplayURL, youtubeId }: ChatReplayProps) {
  const [comments, setComments] = useState<ChatComment[]>([])
  const [visibleComments, setVisibleComments] = useState<ChatComment[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [userScrolled, setUserScrolled] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const MAX_VISIBLE_MESSAGES = 200

  // Load chat messages
  useEffect(() => {
    const fetchComments = async () => {
      try {
        console.log('[ChatReplay] Fetching comments from:', chatReplayURL);
        const response = await fetch(chatReplayURL)
        const data: ChatData = await response.json()
        console.log('[ChatReplay] Fetched', data.comments.length, 'comments');
        setComments(data.comments.sort((a, b) => a.content_offset_seconds - b.content_offset_seconds))
      } catch (error) {
        console.error('[ChatReplay] Error fetching comments:', error)
      }
    }
    fetchComments()
  }, [chatReplayURL])

  // Initialize YouTube Player API
  useEffect(() => {
    if (!youtubeId) return;

    let isApiLoaded = false;
    let attempts = 0;
    const maxAttempts = 10;
    const retryInterval = 1000; // 1 second

    const iframeId = `youtube-player-${youtubeId}`;
    console.log('[ChatReplay] Looking for iframe:', iframeId);

    const initPlayer = () => {
      const iframe = document.getElementById(iframeId);
      if (!iframe) {
        console.error('[ChatReplay] Iframe not found:', iframeId);
        return false;
      }
      console.log('[ChatReplay] Found iframe, initializing player');

      try {
        if (!window.YT || !window.YT.Player) {
          console.log('[ChatReplay] YouTube API not ready yet');
          return false;
        }

        console.log('[ChatReplay] Initializing player');
        
        // Destroy existing player if it exists
        if (playerRef.current) {
          playerRef.current.destroy();
        }

        // Create new player
        playerRef.current = new window.YT.Player(iframeId, {
          videoId: youtubeId,
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
            enablejsapi: 1
          },
          events: {
            onReady: (event: YouTubeEvent) => {
              console.log('[ChatReplay] Player ready');
              isApiLoaded = true;
            },
            onStateChange: (event: YouTubeEvent) => {
              console.log('[ChatReplay] Player state changed:', event.data);
              if (event.data === 1) { // Playing
                const updateTime = () => {
                  if (playerRef.current) {
                    try {
                      const time = playerRef.current.getCurrentTime();
                      setCurrentTime(time);
                      if (event.data === 1) { // Only continue if still playing
                        requestAnimationFrame(updateTime);
                      }
                    } catch (error) {
                      console.error('[ChatReplay] Error getting time:', error);
                    }
                  }
                };
                updateTime();
              }
            },
            onError: (event: any) => {
              console.error('[ChatReplay] Player error:', event.data);
              isApiLoaded = false;
            }
          }
        });
        return true;
      } catch (error) {
        console.error('[ChatReplay] Error initializing player:', error);
        return false;
      }
    };

    const loadYouTubeAPI = () => {
      return new Promise<void>((resolve) => {
        if (window.YT && window.YT.Player) {
          console.log('[ChatReplay] YouTube API already loaded');
          resolve();
          return;
        }

        console.log('[ChatReplay] Loading YouTube API script');
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
          console.log('[ChatReplay] YouTube API script loaded');
          resolve();
        };
      });
    };

    const attemptInitialization = async () => {
      if (attempts >= maxAttempts) {
        console.error('[ChatReplay] Max initialization attempts reached');
        return;
      }

      attempts++;
      console.log(`[ChatReplay] Initialization attempt ${attempts}/${maxAttempts}`);

      await loadYouTubeAPI();
      
      if (!initPlayer()) {
        console.log('[ChatReplay] Initialization failed, retrying...');
        setTimeout(attemptInitialization, retryInterval);
      }
    };

    attemptInitialization();

    return () => {
      if (playerRef.current) {
        console.log('[ChatReplay] Cleaning up player');
        playerRef.current.destroy();
      }
    };
  }, [youtubeId]);

  // Update visible messages based on current time
  useEffect(() => {
    const visibleComments = comments
      .filter(comment => comment.content_offset_seconds <= currentTime)
      .slice(-MAX_VISIBLE_MESSAGES);
    setVisibleComments(visibleComments);

    // Auto-scroll to bottom only if user hasn't scrolled up
    if (chatContainerRef.current && !userScrolled) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentTime, comments, userScrolled]);

  // Handle scroll events
  const handleScroll = () => {
    if (!chatContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 20

    // Update userScrolled state based on scroll position
    setUserScrolled(!isAtBottom)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 p-3 border-b flex justify-between items-center">
        <h3 className="font-semibold">Chat Replay</h3>
        {userScrolled && (
          <button
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
            onClick={() => {
              if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
              }
            }}
          >
            Scrolling Paused
          </button>
        )}
      </div>
      <div 
        ref={chatContainerRef}
        className="grow overflow-y-auto p-4 space-y-2"
        onScroll={handleScroll}
      >
        {visibleComments.map((comment) => (
          <div key={comment._id} className="leading-tight text-sm break-words">
            <span 
              className="font-semibold"
              style={{ color: comment.message.user_color || 'inherit' }}
            >
              {comment.message.user_badges?.map((badge) => (
                <Badge
                  key={`${badge._id}-${badge.version}`}
                  badgeId={badge._id}
                  version={badge.version}
                />
              ))}
              {comment.commenter.display_name}
            </span>{': '}
            <span>{comment.message.body}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
