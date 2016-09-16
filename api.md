### QUEUE

**GET** */api/queue* - Get's the current Queue

**GET** */api/queue/current* - Get's the currently playing track

**POST** */api/queue* - Adds the tracks specified by the tracks POST paramater

**POST** */api/queue/order* - Reorders the queue as specified by the uuids POST paramater

**POST** */api/queue/skip/forward* - Skips the current track

**POST** */api/queue/skip/back* - Skips to the previous track


### Volume

**GET** */api/volume* - Get's the current volume state

**POST** */api/volume* - Set's the volume as specified by the volume POST paramater

**POST** */api/volume/phone/on* - Turns the phone volume on

**POST** */api/volume/phone/off* - Turns the phone volume off


### Player

**POST** */api/player/play* - Plays the current track

**POST** */api/player/pause* - Pauses the current track

**POST** */api/player/seek* - Seeks to the point in the track as specified by the time POST paramater

**POST** */api/player/shuffle/on* - Turns shuffle on

**POST** */api/player/shuffle/off* - Turns shuffle off