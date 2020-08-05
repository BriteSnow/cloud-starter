import { MediaResolution } from 'shared/entities';

/** For all event wks scoped */
interface WksScopedBase {
	wksId: number;
}

interface MediaEvent extends WksScopedBase {
	mediaId: number;
}


export type EventDic = DataEventDic & JobEventDic;



//#region    ---------- Data Events ---------- 
export type DataEventDic = {
	'MediaNew': MediaNew,
	'MediaMainMp4': MediaMainMp4
	'MediaScaledMp4': MediaScaledMp4
}
export type DataEvent = DataEventDic[keyof DataEventDic];

/** Sent when a new media has been added and orginal file uploaded to core store */
export interface MediaNew extends MediaEvent {
	type: 'MediaNew';
	name: string; // the original file name
}

/** Sent, typically by vid-init, when the media main mp4 file is available */
export interface MediaMainMp4 extends MediaEvent {
	type: 'MediaMainMp4';
}

/** Sent, typically by vid-scaler, when the downscale MediaScaledMp4 is available */
export interface MediaScaledMp4 extends MediaEvent {
	type: 'MediaScaledMp4';
	res: MediaResolution
}
//#endregion ---------- /Data Events ---------- 



//#region    ---------- Job Events ---------- 
export type JobEventDic = {
	'JobVidInitTodo': JobVidInitTodo
	'JobVidInitDone': JobVidInitDone
	'JobVidScalerTodo': JobVidScalerTodo
	'JobVidScalerDone': JobVidScalerDone
}

export type JobEvent = JobEventDic[keyof JobEventDic];
export type JobEventName = keyof JobEventDic;

/** Base interface for job done queue messages */
interface JobDoneBase {
	khost: string; // kubernetes container host name
	start: number; // js date num
	duration: number; // in second (sec.ms)	
}

interface JobMediaBase extends MediaEvent {
}

/** 
 * Job: Initisize a media of type video, transcode in mp4 if needed.
 */
export interface JobVidInitTodo extends JobMediaBase {
	type: 'JobVidInitTodo';
	mediaId: number;
}

export interface JobVidInitDone extends JobMediaBase, JobDoneBase {
	type: 'JobVidInitDone';
}

/** 
 * A vid-init todo message 
 */
export interface JobVidScalerTodo extends JobMediaBase {
	type: 'JobVidScalerTodo';
	res: MediaResolution
}

export interface JobVidScalerDone extends JobMediaBase, JobDoneBase {
	type: 'JobVidScalerDone';
	res: JobVidScalerTodo['res']
}
//#endregion ---------- /Job Events ----------
