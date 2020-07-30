
interface WksScopedBase {
	wksId: number;
}

//#region    ---------- Data Events ---------- 
/** Sent when a new media has been added and orginal file uploaded to core store */
export interface MediaNew extends WksScopedBase {
	type: 'media_new';
	mediaId: number; // database id
}

/** When mp4 is available for a given media */
export interface MediaMainMp4 extends WksScopedBase {
	type: 'media_main_mp4';
	mediaId: number; // database id
}
//#endregion ---------- /Data Events ---------- 



//#region    ---------- Job Events ---------- 

/** Base interface for job done queue messages */
interface JobDone {
	khost: string; // kubernetes container host name
	start: number; // js date num
	duration: number; // in second (sec.ms)
}

/** 
 * Job: Initisize a media of type video, transcode in mp4 if needed.
 */
export interface JobVidInitTodo extends WksScopedBase {
	type: 'job_vid_init_todo';
	mediaId: number; // database media.id
}

export interface JobVidInitDone extends WksScopedBase, JobDone {
	type: 'job_vid_init_done';
	mediaId: number; // database media.id
}

/** 
 * A vid-init todo message 
 */
export interface JobVidScalerTodo extends WksScopedBase {
	type: 'job_vid_480p_scaler_todo';
	mediaId: number; // database media.id
}

export interface JobScaler480pDone extends WksScopedBase, JobDone {
	type: 'vid_init_done';
	mediaId: number; // database media.id
}
//#endregion ---------- /Job Events ----------
