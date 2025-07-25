import { LoaderCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

type StatusType = 'online' | 'offline' | 'dnd' | 'idle'

function Status() {
  const [status, setStatus] = useState<StatusType | ''>('')

  useEffect(() => {
    fetch('https://n8n.ltwilson.tv/webhook/discord-status')
      .then((response) => response.json())
      .then((data) => setStatus(data.status))
  }, [])

  const statusConfig = {
    online: {
      text: 'Online',
      bgColor: 'bg-green-500',
      textColor: 'text-black',
    },
    offline: {
      text: 'Offline',
      bgColor: 'bg-background/50',
      textColor: 'text-foreground/50',
    },
    dnd: { 
      text: 'Busy', 
      bgColor: 'bg-red-400', 
      textColor: 'text-black' 
    },
    idle: {
      text: 'Away',
      bgColor: 'bg-yellow-200',
      textColor: 'text-black',
    },
  }

  if (!status) {
    return (
      <div className="h-min rounded-lg bg-background/50 p-2 shadow-md">
        <LoaderCircle className="animate-spin" />
      </div>
    )
  }

  const currentStatus = statusConfig[status] || statusConfig.offline

  return (
    <div
      className={`h-min rounded-lg px-8 py-2 shadow-md ${currentStatus.bgColor}`}
    >
      <h1 className={`font-bold ${currentStatus.textColor}`}>
        { status !== "offline" && (
            <span className="animate-pulse">•&nbsp;</span>
        )}
        {currentStatus.text}
      </h1>
    </div>
  )
}

export default Status
