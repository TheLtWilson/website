import { useState, useEffect } from 'react'
import { LoaderCircle, Info } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'

function DiscordStatus() {
  const [serverName, setServerName] = useState<string | undefined>()
  const [serverId, setServerId] = useState<string | undefined>()
  const [serverIconId, setServerIconId] = useState<string | undefined>()
  const [memberCount, setMemberCount] = useState<number | undefined>()
  const [onlineMemberCount, setOnlineMemberCount] = useState<number | undefined>()
  const [isError, setIsError] = useState<boolean>(false)

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await fetch('https://discord.com/api/v9/invites/fJtyxttGpq?with_counts=true&with_expiration=true')
        const data = await response.json()
        console.log("Discord invite info", data)
        // Set the stuff
        setServerName(data.guild.name)
        setServerId(data.guild.id)
        setServerIconId(data.guild.icon)
        setMemberCount(data.approximate_member_count)
        setOnlineMemberCount(data.approximate_presence_count)
      } catch (error) {
        setIsError(true)
        console.error('Failed to fetch Discord status', error)
      }
    }

    fetchServerStatus()
  }, [])

  // If there is no data yet, we shall load
  if (isError) {
    return (
      <div className="flex flex-row gap-2 opacity-50">
        <Info className='w-12 aspect-square' />
        Something went wrong when fetching the Discord server status.
      </div>
    )
    // If theres an error, i guess we'll account for that
  } else {
    return (
      <div className="flex gap-3">
        { serverIconId && serverId && serverName && memberCount && onlineMemberCount ? (
          <>
            <img
              src={`https://cdn.discordapp.com/icons/${serverId}/${serverIconId}.webp?animated=true`}
              alt={serverName + 'Discord server icon'}
              className="h-12 w-12 rounded-lg"
            />
            <div className="flex flex-col justify-center leading-tight">
              <span className="font-semibold">{serverName}</span>
              <span className="text-sm text-muted-foreground">
                <span className='text-green-500 animate-pulse'>&bull;</span>&nbsp;{onlineMemberCount} members online
              </span>
            </div>
          </>     
        ) : (
          <>
            <Skeleton className="h-12 aspect-square rounded-lg" />
            <div className="flex flex-col gap-1 w-full">
              <Skeleton className='w-full h-6' />
              <Skeleton className='w-full h-4' />
            </div>
          </>
        )}
      </div>
    )
  }
}

export default DiscordStatus