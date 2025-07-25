import { useState, useEffect } from 'react'
import { Info } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'
import moment from 'moment'

type Song = {
  name: string
  artist: string
  album: string
  cover_image_url: string
  url: string
  timestamp: number | undefined
}

function NowPlaying() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [lastPlayed, setLastPlayed] = useState<Song | null>(null)
  const [isError, setIsError] = useState<boolean>(false)

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const response = await fetch('https://n8n.ltwilson.tv/webhook/spotify-status')
        const data = await response.json()
        console.log("Song data", data)
        setIsPlaying(data.isPlaying)
        setLastPlayed(data.song)
      } catch (error) {
        setIsError(true)
        console.error('Failed to fetch now playing:', error)
      }
    }

    fetchNowPlaying()
  }, [])

  // Account for errors i guess
  if (isError) {
    return (
      <div className="flex flex-row gap-2 opacity-50 items-center justify-center">
        <Info size={18} />
        Music unavailable.
      </div>
    )
  } else {
    if (!lastPlayed) {
      return (
        <div className="flex flex-col p-4">
          <div className="flex items-center gap-3 rounded-md ">
            <Skeleton className="h-12 aspect-square rounded-lg" />
            <div className="flex flex-col gap-1 w-full">
              <Skeleton className="w-full h-6" />
              <Skeleton className="w-full h-4" />
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <a href={lastPlayed.url} target="_blank" className='flex flex-col p-4 transition-colors rounded-lg hover:bg-primary/10'>
          <div className="flex items-center gap-3 rounded-md ">
            <img
              src={lastPlayed.cover_image_url}
              alt={lastPlayed.name}
              className="h-12 w-12 rounded-lg"
            />
            <div className="flex flex-col leading-tight min-w-0">
              <h3 className="text-md font-extrabold truncate">{lastPlayed.name}</h3>
              <p className="text-xs font-semibold opacity-50 truncate">{lastPlayed.artist}</p>
            </div>
          </div>
          <div className="flex justify-between text-sm mt-2">
            { isPlaying == true && lastPlayed.timestamp ? (
              <p className="text-green-500 font-bold animate-pulse">•&nbsp;Now Playing</p>
            ) : (
              <p className="opacity-50">{lastPlayed.timestamp !== undefined ? moment(lastPlayed.timestamp*1000).fromNow() : 'Unknown time'}</p>
            )}
            <p className="opacity-30">via LastFM</p>
          </div>
        </a>
      )
    }
  }
}

export default NowPlaying