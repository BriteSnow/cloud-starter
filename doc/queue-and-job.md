
The `cloud-starter` Big App pattern consists in a full event based cloud application architecture, based on [Redis Stream](https://redis.io/topics/streams-intro), which has all services talking to a bus/queue, and avoid any service to service direct communication.


![](images/arch-queue.png)

Here are the key points of such architecture: 

- Queues are based on [Redis Stream](https://redis.io/topics/streams-intro)
- **Queue event messages** are **fully typed** via TypeScript. (see [event-types.ts](../shared/src/event-types.ts))
- There are two type of queues: 
  - **Application Queues** are data and notification events such as new content available in the store buckets or other application notifications.
  - **Job Queues** are specialized queues that represents work to be done by a service, such as transcoding a video, scaling it down, and so on. Typically, there isone Job Queue Event type per Job Service. 
- **Bridges** are processes that bridge two queues, by creating a new event for the destination queues based on a source queue. 
  - For examples: 
    - A `vid-init` bridge will create a new `VidInitJob` Job Queue event for each Application `MediaNew` event that are of video mime type. [vid-init/src/wkr-bridge-media-new.ts](../services/vid-init/src/wkr-bridge-media-new.ts)
    - A `vid-scaler` bridge will create a new `VidScalerJob` Job Que event when new `MediaMainMp4` data event are received. See [vid-scaler/src/wkr-bridge-media-mp4.ts](../services/vid-scaler/src/wkr-bridge-media-mp4.ts)
  - Best pratice: 
    - Bridges are Nodejs Worker Thread, one file per bridge, starting with `wkr-...ts`, and they are started on the appropriate service `start.ts`




